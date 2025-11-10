import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalBuyNowInitializeOptions,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../paypal-commerce-types';

import PayPalCommerceButtonInitializeOptions, {
    WithPayPalCommerceButtonInitializeOptions,
} from './paypal-commerce-button-initialize-options';

export default class PayPalCommerceButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
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

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, paypalcommerce, isBuyNowFlow);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommerce: PayPalCommerceButtonInitializeOptions,
        isBuyNowFlow?: boolean,
    ): void {
        const { buyNowInitializeOptions, style, onComplete, onEligibilityFailure } = paypalcommerce;
        this.handleClick(buyNowInitializeOptions);

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { isHostedCheckoutEnabled, isAppSwitchEnabled } =
            paymentMethod.initializationData || {};

        console.log('IS BUY NOW FLOW', isBuyNowFlow);

        const defaultCallbacks = {
            ...(
                this.isPaypalCommerceAppSwitchEnabled(methodId) && {
                    appSwitchWhenAvailable: true,
                }),
            createOrder: () => this.paypalCommerceIntegrationService.createOrder('paypalcommerce'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            // onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const hostedCheckoutCallbacks = {
            ...(!isBuyNowFlow && !isAppSwitchEnabled && {
                onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                    this.onShippingAddressChange(data),
                onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                    this.onShippingOptionsChange(data),
            }),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(data, actions, methodId, onComplete),
        };

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(style),
            ...defaultCallbacks,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
            ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            if (paypalButton.hasReturned?.() && this.isPaypalCommerceAppSwitchEnabled(methodId)) {
                paypalButton.resume?.();
            } else {
                paypalButton.render(`#${containerId}`);
            }
        } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        } else {
            this.paypalCommerceIntegrationService.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions?: PayPalBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.paypalCommerceIntegrationService.createBuyNowCartOrThrow(
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
                this.paypalCommerceIntegrationService.getBillingAddressFromOrderDetails(
                    orderDetails,
                );

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                const shippingAddress =
                    this.paypalCommerceIntegrationService.getShippingAddressFromOrderDetails(
                        orderDetails,
                    );

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.paypalCommerceIntegrationService.updateOrder();
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.paypalCommerceIntegrationService.submitPayment(methodId, data.orderID);

            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }

            return true; // FIXME: Do we really need to return true here?
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }

    private async onShippingAddressChange(
        data: ShippingAddressChangeCallbackPayload,
    ): Promise<void> {
        const address = this.paypalCommerceIntegrationService.getAddress({
            city: data.shippingAddress.city,
            countryCode: data.shippingAddress.countryCode,
            postalCode: data.shippingAddress.postalCode,
            stateOrProvinceCode: data.shippingAddress.state,
        });

        try {
            // Info: we use the same address to fill billing and shipping addresses to have valid quota on BE for order updating process
            // on this stage we don't have access to valid customer's address accept shipping data
            await this.paymentIntegrationService.updateBillingAddress(address);
            await this.paymentIntegrationService.updateShippingAddress(address);

            const shippingOption = this.paypalCommerceIntegrationService.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalCommerceIntegrationService.updateOrder();
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }

    private async onShippingOptionsChange(
        data: ShippingOptionChangeCallbackPayload,
    ): Promise<void> {
        const shippingOption = this.paypalCommerceIntegrationService.getShippingOptionOrThrow(
            data.selectedShippingOption.id,
        );

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalCommerceIntegrationService.updateOrder();
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }

    /**
     *
     * PayPal AppSwitch enabling handling
     *
     */
    private isPaypalCommerceAppSwitchEnabled(methodId: string): boolean {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        return paymentMethod.initializationData?.isAppSwitchEnabled || false;
    }
}
