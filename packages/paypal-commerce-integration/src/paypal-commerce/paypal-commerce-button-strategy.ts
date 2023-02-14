import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceCommon from '../paypal-commerce-common';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalBuyNowInitializeOptions,
    PayPalCommerceButtonsOptions,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../paypal-commerce-types';

import PayPalCommerceButtonInitializeOptions, {
    WithPayPalCommerceButtonInitializeOptions,
} from './paypal-commerce-button-initialize-options';

export default class PayPalCommerceButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceCommon: PayPalCommerceCommon,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommerce, containerId, methodId } = options;

        const isBuyNowFlow = Boolean(paypalcommerce?.buyNowInitializeOptions);

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

        if (isBuyNowFlow && !paypalcommerce.currencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof paypalcommerce.buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
            );
        }

        if (!isBuyNowFlow) {
            // Info: default checkout should not be loaded for BuyNow flow,
            // since there is no checkout session available for that.
            await this.paymentIntegrationService.loadDefaultCheckout();
        }

        // Info: we are using provided currency code for buy now cart,
        // because checkout session is not available before buy now cart creation,
        // hence application will throw an error on getCartOrThrow method call
        const currencyCode = isBuyNowFlow
            ? paypalcommerce.currencyCode
            : this.paymentIntegrationService.getState().getCartOrThrow().currency.code;

        await this.paypalCommerceCommon.loadPayPalSdk(methodId, currencyCode, false);

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
        const { buyNowInitializeOptions, style, onComplete } = paypalcommerce;

        const paypalSdk = this.paypalCommerceCommon.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { isHostedCheckoutEnabled } = paymentMethod.initializationData;

        const defaultCallbacks = {
            createOrder: () => this.paypalCommerceCommon.createOrder('paypalcommerce'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceCommon.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
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
            style: this.paypalCommerceCommon.getValidButtonStyle(style),
            ...defaultCallbacks,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
            ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this.paypalCommerceCommon.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions?: PayPalBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.paypalCommerceCommon.createBuyNowCartOrThrow(
                buyNowInitializeOptions,
            );

            await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
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
            const billingAddress =
                this.paypalCommerceCommon.getBillingAddressFromOrderDetails(orderDetails);

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                const shippingAddress =
                    this.paypalCommerceCommon.getShippingAddressFromOrderDetails(orderDetails);

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.paypalCommerceCommon.updateOrder();
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.paypalCommerceCommon.submitPayment(methodId, data.orderID);

            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }

            return true; // FIXME: Do we really need to return true here?
        } catch (error) {
            throw new Error(error);
        }
    }

    private async onShippingAddressChange(
        data: ShippingAddressChangeCallbackPayload,
    ): Promise<void> {
        const address = this.paypalCommerceCommon.getAddress({
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

            const shippingOption = this.paypalCommerceCommon.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalCommerceCommon.updateOrder();
        } catch (error) {
            throw new Error(error);
        }
    }

    private async onShippingOptionsChange(
        data: ShippingOptionChangeCallbackPayload,
    ): Promise<void> {
        const shippingOption = this.paypalCommerceCommon.getShippingOptionOrThrow(
            data.selectedShippingOption.id,
        );

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalCommerceCommon.updateOrder();
        } catch (error) {
            throw new Error(error);
        }
    }
}
