import {
    BillingAddressRequestBody,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    CompleteCallbackDataPayload,
    PayPalCommerceButtonsOptions,
    PayPalCommerceIntent,
    PayPalSDK,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../paypal-commerce-types';

import PayPalCommerceInlineButtonInitializeOptions, {
    WithPayPalCommerceInlineButtonInitializeOptions,
} from './paypal-commerce-inline-button-initialize-options';

export default class PayPalCommerceInlineButtonStrategy implements CheckoutButtonStrategy {
    private paypalSdk?: PayPalSDK;
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceInlineButtonInitializeOptions,
    ): Promise<void> {
        const { containerId, methodId, paypalcommerceinline } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.containerId" argument is not provided.',
            );
        }

        if (!paypalcommerceinline) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerceinline" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadDefaultCheckout();
        // await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const currencyCode = state.getCartOrThrow().currency.code;
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
            paymentMethod,
            currencyCode,
            false,
        );

        this.renderButton(methodId, containerId, paypalcommerceinline);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        methodId: string,
        containerId: string,
        paypalcommerceinline: PayPalCommerceInlineButtonInitializeOptions,
    ): void {
        const paypalSdk = this.getPayPalSdkOrThrow();
        const { buttonContainerClassName, style, onComplete, onError } = paypalcommerceinline;

        if (!onComplete || typeof onComplete !== 'function') {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerceinline.onComplete" argument is not provided or it is not a function.`,
            );
        }

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            experience: 'accelerated',
            fundingSource: paypalSdk.FUNDING.CARD,
            style,
            createOrder: () => this.createOrder(methodId),
            onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                this.onShippingAddressChange(data),
            onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                this.onShippingOptionsChange(data),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onApprove(data, actions, methodId),
            onComplete: (data: CompleteCallbackDataPayload) =>
                this.onComplete(data, methodId, onComplete),
            onError: (error: Error) => this.onError(error, onError),
        };

        const paypalButtonRender = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            const buttonContainerId = `${containerId}-paypal-accelerated-checkout-button`;

            this.createPayPalButtonContainer(
                containerId,
                buttonContainerId,
                buttonContainerClassName,
            );

            paypalButtonRender.render(`#${buttonContainerId}`);
        }
    }

    private async createOrder(methodId: string): Promise<string> {
        const state = this.paymentIntegrationService.getState();
        const cartId = state.getCartOrThrow().id;

        const { orderId } = await this.paypalCommerceRequestSender.createOrder(methodId, {
            cartId,
        });

        return orderId;
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

        // Info: we use the same address to fill billing and shipping addresses to have valid quota on BE for order updating process
        // on this stage we don't have access to valid customer's address except shipping data
        await this.paymentIntegrationService.updateBillingAddress(address);
        await this.paymentIntegrationService.updateShippingAddress(address);

        const shippingOption = this.getShippingOptionOrThrow();

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.updateOrder();
        } catch (error) {
            this.onError(error);
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
            this.onError(error);
        }
    }

    private async onApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
    ): Promise<boolean> {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const orderDetails = await actions.order.get();

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

        return true;
    }

    private async onComplete(
        data: CompleteCallbackDataPayload,
        methodId: string,
        callback?: () => void,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { intent } = paymentMethod.initializationData;

        if (intent === PayPalCommerceIntent.CAPTURE) {
            await this.submitPayment(methodId, data.orderID);
        }

        if (callback) {
            callback();
        }
    }

    private onError(error: Error, onError?: () => void): void {
        if (onError && typeof onError === 'function') {
            onError();
        }

        throw new Error(error.message);
    }

    private async updateOrder(): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const consignment = state.getConsignmentsOrThrow()[0];

        await this.paypalCommerceRequestSender.updateOrder({
            availableShippingOptions: consignment.availableShippingOptions,
            cartId: cart.id,
            selectedShippingOption: consignment.selectedShippingOption,
        });
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

    private getShippingOptionOrThrow(selectedShippingOptionId?: string): ShippingOption {
        const consignment = this.paymentIntegrationService.getState().getConsignmentsOrThrow()[0];
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

    private createPayPalButtonContainer(
        containerId: string,
        buttonContainerId: string,
        buttonContainerClassName = 'PaypalCommerceInlineButton',
    ): void {
        const paypalButtonContainer = document.createElement('div');

        paypalButtonContainer.setAttribute('class', buttonContainerClassName);
        paypalButtonContainer.setAttribute('id', buttonContainerId);

        const container = document.getElementById(containerId);

        if (container) {
            container.innerHTML = '';
            container.append(paypalButtonContainer);
        }
    }

    private getPayPalSdkOrThrow(): PayPalSDK {
        if (!this.paypalSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalSdk;
    }
}
