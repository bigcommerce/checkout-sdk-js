import {
    InvalidArgumentError,
    NotImplementedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getPaypalMessagesStylesFromBNPLConfig,
    MessagingOptions,
    PayPalBNPLConfigurationItem,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
    PayPalMessagesSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackPayload,
    BigCommerceButtons,
    BigCommerceButtonsOptions,
    BigCommerceInitializationData,
    ClickCallbackActions,
} from '../big-commerce-types';

import BigCommerceCreditPaymentInitializeOptions, {
    WithBigCommerceCreditPaymentInitializeOptions,
} from './big-commerce-credit-payment-initialize-options';

export default class BigCommerceCreditPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private bigcommerceButton?: BigCommerceButtons;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
        private paypalCommerceSdk: PayPalCommerceSdk,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithBigCommerceCreditPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, bigcommerce, bigcommerce_payments_paylater } = options || {};

        const bigcommerceOptions = bigcommerce_payments_paylater || bigcommerce;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerceOptions) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId); // TODO: double check if this is correct type
        // TODO: update paypalBNPLConfiguration with empty array as default value when PROJECT-6784.paypal_commerce_bnpl_configurator experiment is rolled out to 100%
        const { paypalBNPLConfiguration, orderId } = paymentMethod.initializationData || {};
        const { bannerContainerId = '', container } = bigcommerceOptions;

        // TODO: remove paypalBNPLConfiguration check when PROJECT-6784.paypal_commerce_bnpl_configurator experiment is rolled out to 100%
        if (paypalBNPLConfiguration && document.getElementById(bannerContainerId)) {
            const bannerConfiguration = paypalBNPLConfiguration.find(({ id }) => id === 'checkout');

            if (!bannerConfiguration?.status) {
                return;
            }

            const paypalMessages = await this.paypalCommerceSdk.getPayPalMessages(
                paymentMethod,
                state.getCartOrThrow().currency.code,
            );

            return this.renderMessages(paypalMessages, bannerContainerId, bannerConfiguration);
        }

        // TODO: this condition can be removed when PROJECT-6784.paypal_commerce_bnpl_configurator experiment is rolled out to 100%
        if (document.getElementById(bannerContainerId)) {
            const paypalMessages = await this.paypalCommerceSdk.getPayPalMessages(
                paymentMethod,
                state.getCartOrThrow().currency.code,
            );

            return this.renderMessages(paypalMessages, bannerContainerId);
        }

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (orderId) {
            this.orderId = orderId;

            return;
        }

        await this.bigCommerceIntegrationService.loadBigCommerceSdk(methodId);

        this.loadingIndicatorContainer = container?.split('#')[1];

        this.renderButton(methodId, bigcommerceOptions);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.bigCommerceIntegrationService.submitPayment(payment.methodId, this.orderId);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.orderId = undefined;

        this.bigcommerceButton?.close();

        return Promise.resolve();
    }

    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton(
        methodId: string,
        bigcommerceOptions: BigCommerceCreditPaymentInitializeOptions,
    ): void {
        if (!bigcommerceOptions?.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "container" argument is not provided.',
            );
        }

        const bigcommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutPaymentButtonStyles } = paymentButtonStyles || {};

        const { container, onError, onRenderButton, onValidate, submitForm } = bigcommerceOptions;

        const fundingSources = [bigcommerceSdk.FUNDING.PAYLATER, bigcommerceSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (hasRenderedSmartButton) {
                return;
            }

            const buttonOptions: BigCommerceButtonsOptions = {
                fundingSource,
                style: this.bigCommerceIntegrationService.getValidButtonStyle(
                    checkoutPaymentButtonStyles,
                ),
                createOrder: () =>
                    this.bigCommerceIntegrationService.createOrder('bigcommercecreditcheckout'),
                onClick: (_, actions) => this.handleClick(actions, onValidate),
                onApprove: (data) => this.handleApprove(data, submitForm),
                onCancel: () => this.toggleLoadingIndicator(false),
                onError: (error) => this.handleError(error, onError),
            };

            this.bigcommerceButton = bigcommerceSdk.Buttons(buttonOptions);

            if (
                !this.bigcommerceButton.isEligible() &&
                fundingSource === bigcommerceSdk.FUNDING.PAYLATER
            ) {
                return;
            }

            if (
                !this.bigcommerceButton.isEligible() &&
                fundingSource === bigcommerceSdk.FUNDING.CREDIT
            ) {
                throw new NotImplementedError(
                    `BigCommerce ${fundingSource} is not available for your region. Please use BigCommerce Checkout instead.`,
                );
            }

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            this.bigcommerceButton.render(container);
            hasRenderedSmartButton = true;
        });
    }

    private async handleClick(
        actions: ClickCallbackActions,
        onValidate: BigCommerceCreditPaymentInitializeOptions['onValidate'],
    ): Promise<void> {
        const { resolve, reject } = actions;

        const onValidationPassed = () => {
            this.toggleLoadingIndicator(true);

            return resolve();
        };

        if (onValidate && typeof onValidate === 'function') {
            await onValidate(onValidationPassed, reject);
        }
    }

    private handleApprove(
        { orderID }: ApproveCallbackPayload,
        submitForm: BigCommerceCreditPaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        if (submitForm && typeof submitForm === 'function') {
            submitForm();
        }
    }

    private handleError(
        error: Error,
        onError: BigCommerceCreditPaymentInitializeOptions['onError'],
    ): void {
        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }

    /**
     *
     * Render Pay Later Messages
     *
     * */
    private renderMessages(
        paypalMessages: PayPalMessagesSdk,
        bannerContainerId: string,
        bannerConfiguration?: PayPalBNPLConfigurationItem, // TODO: this should not be optional when PROJECT-6784.paypal_commerce_bnpl_configurator experiment is rolled out to 100%
    ): void {
        const checkout = this.paymentIntegrationService.getState().getCheckoutOrThrow();
        const grandTotal = checkout.outstandingBalance;
        // TODO: default style can be removed when PROJECT-6784.paypal_commerce_bnpl_configurator experiment is rolled out to 100%
        const style = bannerConfiguration
            ? getPaypalMessagesStylesFromBNPLConfig(bannerConfiguration)
            : {
                  layout: 'text',
                  logo: {
                      type: 'inline',
                  },
              };

        const paypalMessagesOptions: MessagingOptions = {
            amount: grandTotal,
            placement: 'payment',
            style,
        };

        paypalMessages.Messages(paypalMessagesOptions).render(`#${bannerContainerId}`);
    }
}
