import { FormPoster } from '@bigcommerce/form-poster';

import {
    BillingAddressRequestBody,
    BuyNowCartCreationError,
    CartSource,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    RequestError,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalButtonStyleOptions,
    PayPalCommerceButtonsOptions,
    PayPalSDK,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../paypal-commerce-types';
import { getValidButtonStyle } from '../utils';

import PayPalCommerceButtonInitializeOptions, {
    WithPayPalCommerceButtonInitializeOptions,
} from './paypal-commerce-button-initialize-options';

export default class PayPalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private paypalSdk?: PayPalSDK;

    constructor(
        private formPoster: FormPoster,
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommerce, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        if (paypalcommerce.buyNowInitializeOptions) {
            const state = this.paymentIntegrationService.getState();
            const paymentMethod = state.getPaymentMethodOrThrow(methodId);

            if (!paypalcommerce.currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.paypalcommerce.currencyCode" argument is not provided.`,
                );
            }

            this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
                paymentMethod,
                paypalcommerce.currencyCode,
                paypalcommerce.initializesOnCheckoutPage,
            );
        } else {
            await this.paymentIntegrationService.loadDefaultCheckout();

            const state = this.paymentIntegrationService.getState();
            const currencyCode = state.getCartOrThrow().currency.code;
            const paymentMethod = state.getPaymentMethodOrThrow(methodId);

            this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
                paymentMethod,
                currencyCode,
                paypalcommerce.initializesOnCheckoutPage,
            );
        }

        this.renderButton(containerId, methodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommerce: PayPalCommerceButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, initializesOnCheckoutPage, style, onComplete } =
            paypalcommerce;

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { isHostedCheckoutEnabled } = paymentMethod.initializationData;
        const paypalSdk = this.getPayPalSdkOrThrow();

        if (isHostedCheckoutEnabled && (!onComplete || typeof onComplete !== 'function')) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.onComplete" argument is not provided or it is not a function.`,
            );
        }

        const defaultCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            createOrder: () => this.createOrder(initializesOnCheckoutPage),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.tokenizePayment(methodId, orderID),
        };

        const hostedCheckoutCallbacks = {
            onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                this.onShippingAddressChange(data),
            onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                this.onShippingOptionsChange(data),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(data, actions, methodId, onComplete),
        };

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: style ? this.getButtonStyle(style) : {},
            ...defaultCallbacks,
            ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions: PayPalCommerceButtonInitializeOptions['buyNowInitializeOptions'],
    ): Promise<void> {
        if (
            buyNowInitializeOptions &&
            typeof buyNowInitializeOptions.getBuyNowCartRequestBody === 'function'
        ) {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            try {
                const buyNowCart = await this.paymentIntegrationService.createBuyNowCart(
                    cartRequestBody,
                );

                await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    private async onHostedCheckoutApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
        onComplete?: () => void,
    ): Promise<boolean> {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const orderDetails = await actions.order.get();

        try {
            if (cart.lineItems.physicalItems.length > 0) {
                const { payer, purchase_units } = orderDetails;
                const shippingAddress = purchase_units[0]?.shipping?.address || {};

                const address = this.getAddress({
                    firstName: payer.name.given_name,
                    lastName: payer.name.surname,
                    email: payer.email_address,
                    address1: shippingAddress.address_line_1,
                    city: shippingAddress.admin_area_2,
                    countryCode: shippingAddress.country_code,
                    postalCode: shippingAddress.postal_code,
                    stateOrProvinceCode: shippingAddress.admin_area_1,
                });

                await this.paymentIntegrationService.updateBillingAddress(address);
                await this.paymentIntegrationService.updateShippingAddress(address);
                await this.updateOrder();
            } else {
                const { payer } = orderDetails;

                const address = this.getAddress({
                    firstName: payer.name.given_name,
                    lastName: payer.name.surname,
                    email: payer.email_address,
                    address1: payer.address.address_line_1,
                    city: payer.address.admin_area_2,
                    countryCode: payer.address.country_code,
                    postalCode: payer.address.postal_code,
                    stateOrProvinceCode: payer.address.admin_area_1,
                });

                await this.paymentIntegrationService.updateBillingAddress(address);
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.submitPayment(methodId, data.orderID);

            if (onComplete) {
                onComplete();
            }

            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    private async onShippingAddressChange(
        data: ShippingAddressChangeCallbackPayload,
    ): Promise<void> {
        const address = this.getAddress({
            city: data.shippingAddress.city,
            countryCode: data.shippingAddress.country_code,
            postalCode: data.shippingAddress.postal_code,
            stateOrProvinceCode: data.shippingAddress.state,
        });

        try {
            // Info: we use the same address to fill billing and consignment addresses to have valid quota on BE for order updating process
            // on this stage we don't have access to valid customer's address accept shipping data
            await this.paymentIntegrationService.updateBillingAddress(address);
            await this.paymentIntegrationService.updateShippingAddress(address);

            const shippingOption = this.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);

            await this.updateOrder();
        } catch (error) {
            throw new Error(error);
        }
    }

    private async onShippingOptionsChange(
        data: ShippingOptionChangeCallbackPayload,
    ): Promise<void> {
        const shippingOption = this.getShippingOptionOrThrow(data.selectedShippingOption.id);

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.updateOrder();
        } catch (error) {
            throw new Error(error);
        }
    }

    private async submitPayment(methodId: string, orderId: string): Promise<void> {
        const paymentData = {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: null,
                method_id: methodId,
                paypal_account: {
                    order_id: orderId,
                },
            },
        };

        await this.paymentIntegrationService.submitPayment({ methodId, paymentData });
    }

    private async updateOrder(): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const consignment = state.getConsignmentsOrThrow()[0];

        try {
            await this.paypalCommerceRequestSender.updateOrder({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
        } catch (_error) {
            throw new RequestError();
        }
    }

    private getAddress(address?: Partial<BillingAddressRequestBody>): BillingAddressRequestBody {
        return {
            firstName: address?.firstName || '',
            lastName: address?.lastName || '',
            email: address?.email || '',
            phone: '',
            company: '',
            address1: address?.address1 || '',
            address2: '',
            city: address?.city || '',
            countryCode: address?.countryCode || '',
            postalCode: address?.postalCode || '',
            stateOrProvince: '',
            stateOrProvinceCode: address?.stateOrProvinceCode || '',
            customFields: [],
        };
    }

    private getShippingOptionOrThrow(selectedShippingOptionId?: string): ShippingOption {
        const state = this.paymentIntegrationService.getState();
        const consignment = state.getConsignmentsOrThrow()[0];

        const availableShippingOptions = consignment.availableShippingOptions || [];

        const recommendedShippingOption = availableShippingOptions.find(
            (option) => option.isRecommended,
        );

        const selectedShippingOption = selectedShippingOptionId
            ? availableShippingOptions.find((option) => option.id === selectedShippingOptionId)
            : availableShippingOptions.find(
                  (option) => option.id === consignment.selectedShippingOption?.id,
              );

        const shippingOptionToSelect =
            selectedShippingOption || recommendedShippingOption || availableShippingOptions[0];

        if (!shippingOptionToSelect) {
            throw new Error("Your order can't be shipped to this address");
        }

        return shippingOptionToSelect;
    }

    private async createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const cartId = this.paymentIntegrationService.getState().getCartOrThrow().id;

        const providerId = initializesOnCheckoutPage ? 'paypalcommercecheckout' : 'paypalcommerce';

        const { orderId } = await this.paypalCommerceRequestSender.createOrder(providerId, {
            cartId,
        });

        return orderId;
    }

    private tokenizePayment(methodId: string, orderId?: string): void {
        const cart = this.paymentIntegrationService.getState().getCartOrThrow();

        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this.formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: methodId,
            order_id: orderId,
            ...(cart.source === CartSource.BuyNow && { cart_id: cart.id }),
        });
    }

    private getPayPalSdkOrThrow(): PayPalSDK {
        if (!this.paypalSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalSdk;
    }

    private getButtonStyle(style: PayPalButtonStyleOptions): PayPalButtonStyleOptions {
        const { color, height, label, layout, shape } = getValidButtonStyle(style);

        return { color, height, label, layout, shape };
    }

    private removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
