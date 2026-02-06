import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    getPaypalMessagesStylesFromBNPLConfig,
    MessagingOptions,
    PayPalBNPLConfigurationItem,
    PayPalButtonsOptions,
    PayPalBuyNowInitializeOptions,
    PayPalInitializationData,
    PayPalIntegrationService,
    PayPalMessagesSdk,
    PayPalSdkScriptLoader,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCreditButtonInitializeOptions, {
    WithPayPalCommerceCreditButtonInitializeOptions,
} from './paypal-commerce-credit-button-initialize-options';

export default class PayPalCommerceCreditButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalCommerceSdk: PayPalSdkScriptLoader,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceCreditButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommercecredit, containerId, methodId } = options;
        const {
            buyNowInitializeOptions,
            currencyCode: providedCurrencyCode,
            messagingContainerId,
        } = paypalcommercecredit || {};

        const isBuyNowFlow = !!buyNowInitializeOptions;

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

        if (!paypalcommercecredit) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercecredit" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !providedCurrencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercecredit.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercecredit.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
            );
        }

        if (!isBuyNowFlow) {
            // Info: default checkout should not be loaded for BuyNow flow,
            // since there is no checkout session available for that.
            await this.paymentIntegrationService.loadDefaultCheckout();
        }

        const state = this.paymentIntegrationService.getState();

        // Info: we are using provided currency code for buy now cart,
        // because checkout session is not available before buy now cart creation,
        // hence application will throw an error on getCartOrThrow method call
        const currencyCode = isBuyNowFlow
            ? providedCurrencyCode
            : state.getCartOrThrow().currency.code;

        await this.paypalIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, paypalcommercecredit);

        // TODO: remove banner rendering implementation in this file when PAYPAL-5557.Hide_ppc_banner_implementation will be rolled out to 100%
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const isBannerImplementationDisabled =
            features['PAYPAL-5557.Hide_ppc_banner_implementation'] ?? false;

        if (isBannerImplementationDisabled) {
            return;
        }

        const messagingContainer =
            messagingContainerId && document.getElementById(messagingContainerId);

        if (currencyCode && messagingContainer) {
            const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);

            const { paypalBNPLConfiguration = [] } = paymentMethod.initializationData || {};
            const bannerConfiguration =
                paypalBNPLConfiguration && paypalBNPLConfiguration.find(({ id }) => id === 'cart');

            if (!bannerConfiguration?.status) {
                return;
            }

            // TODO: remove this code when data attributes will be removed from the banner container in content service
            messagingContainer.removeAttribute('data-pp-style-logo-type');
            messagingContainer.removeAttribute('data-pp-style-logo-position');
            messagingContainer.removeAttribute('data-pp-style-text-color');
            messagingContainer.removeAttribute('data-pp-style-text-size');

            const paypalSdk = await this.paypalCommerceSdk.getPayPalMessages(
                paymentMethod,
                currencyCode,
            );

            this.renderMessages(paypalSdk, messagingContainerId, bannerConfiguration);
        }
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommercecredit: PayPalCommerceCreditButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onComplete, onEligibilityFailure } =
            paypalcommercecredit;

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const { isHostedCheckoutEnabled, isAppSwitchEnabled } =
            paymentMethod.initializationData || {};

        const defaultCallbacks = {
            createOrder: () => this.paypalIntegrationService.createOrder('paypalcommercecredit'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const hostedCheckoutCallbacks = {
            ...(!isAppSwitchEnabled && {
                onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                    this.onShippingAddressChange(data),
                onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                    this.onShippingOptionsChange(data),
            }),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(data, actions, methodId, onComplete),
        };

        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: PayPalButtonsOptions = {
                    fundingSource,
                    style: this.paypalIntegrationService.getValidButtonStyle(style),
                    ...defaultCallbacks,
                    ...(buyNowInitializeOptions && buyNowFlowCallbacks),
                    ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
                };

                const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

                if (paypalButton.isEligible()) {
                    paypalButton.render(`#${containerId}`);
                    hasRenderedSmartButton = true;
                } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
                    onEligibilityFailure();
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this.paypalIntegrationService.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions?: PayPalBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.paypalIntegrationService.createBuyNowCartOrThrow(
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
                this.paypalIntegrationService.getBillingAddressFromOrderDetails(orderDetails);

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                const shippingAddress =
                    this.paypalIntegrationService.getShippingAddressFromOrderDetails(orderDetails);

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.paypalIntegrationService.updateOrder('paypalcommerce');
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.paypalIntegrationService.submitPayment(methodId, data.orderID);

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
        const address = this.paypalIntegrationService.getAddress({
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

            const shippingOption = this.paypalIntegrationService.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalIntegrationService.updateOrder('paypalcommerce');
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
        const shippingOption = this.paypalIntegrationService.getShippingOptionOrThrow(
            data.selectedShippingOption.id,
        );

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalIntegrationService.updateOrder('paypalcommerce');
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }

    private renderMessages(
        paypalMessagesSdk: PayPalMessagesSdk,
        messagingContainerId: string,
        bannerConfiguration: PayPalBNPLConfigurationItem,
    ): void {
        const checkout = this.paymentIntegrationService.getState().getCheckoutOrThrow();

        const paypalMessagesOptions: MessagingOptions = {
            amount: checkout.outstandingBalance,
            placement: 'cart',
            style: getPaypalMessagesStylesFromBNPLConfig(bannerConfiguration),
        };

        const paypalMessages = paypalMessagesSdk.Messages(paypalMessagesOptions);

        paypalMessages.render(`#${messagingContainerId}`);
    }
}
