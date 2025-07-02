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

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackPayload,
    ClickCallbackActions,
    PayPalCommerceButtons,
    PayPalCommerceButtonsOptions,
} from '../paypal-commerce-types';

import PayPalCommerceCreditPaymentInitializeOptions, {
    WithPayPalCommerceCreditPaymentInitializeOptions,
} from './paypal-commerce-credit-payment-initialize-options';

export default class PayPalCommerceCreditPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private paypalButton?: PayPalCommerceButtons;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
        private paypalCommerceSdk: PayPalCommerceSdk,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithPayPalCommerceCreditPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommerce, paypalcommercecredit } = options || {};

        const paypalOptions = paypalcommercecredit || paypalcommerce;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalOptions) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        const { paypalBNPLConfiguration = [], orderId } = paymentMethod.initializationData || {};
        const { bannerContainerId = '', container } = paypalOptions;

        if (document.getElementById(bannerContainerId)) {
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

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (orderId) {
            this.orderId = orderId;

            return;
        }

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.loadingIndicatorContainer = container?.split('#')[1];

        this.renderButton(methodId, paypalOptions);
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
        await this.paypalCommerceIntegrationService.submitPayment(payment.methodId, this.orderId);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.orderId = undefined;

        this.paypalButton?.close();

        return Promise.resolve();
    }

    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton(
        methodId: string,
        paypalOptions: PayPalCommerceCreditPaymentInitializeOptions,
    ): void {
        if (!paypalOptions?.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "container" argument is not provided.',
            );
        }

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutPaymentButtonStyles } = paymentButtonStyles || {};

        const { container, onError, onRenderButton, onValidate, submitForm } = paypalOptions;

        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (hasRenderedSmartButton) {
                return;
            }

            const buttonOptions: PayPalCommerceButtonsOptions = {
                fundingSource,
                style: this.paypalCommerceIntegrationService.getValidButtonStyle(
                    checkoutPaymentButtonStyles,
                ),
                createOrder: () =>
                    this.paypalCommerceIntegrationService.createOrder(
                        'paypalcommercecreditcheckout',
                    ),
                onClick: (_, actions) => this.handleClick(actions, onValidate),
                onApprove: (data) => this.handleApprove(data, submitForm),
                onCancel: () => this.toggleLoadingIndicator(false),
                onError: (error) => this.handleError(error, onError),
            };

            this.paypalButton = paypalSdk.Buttons(buttonOptions);

            if (!this.paypalButton.isEligible() && fundingSource === paypalSdk.FUNDING.PAYLATER) {
                return;
            }

            if (!this.paypalButton.isEligible() && fundingSource === paypalSdk.FUNDING.CREDIT) {
                throw new NotImplementedError(
                    `PayPal ${fundingSource} is not available for your region. Please use PayPal Checkout instead.`,
                );
            }

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            this.paypalButton.render(container);
            hasRenderedSmartButton = true;
        });
    }

    private async handleClick(
        actions: ClickCallbackActions,
        onValidate: PayPalCommerceCreditPaymentInitializeOptions['onValidate'],
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
        submitForm: PayPalCommerceCreditPaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        if (submitForm && typeof submitForm === 'function') {
            submitForm();
        }
    }

    private handleError(
        error: Error,
        onError: PayPalCommerceCreditPaymentInitializeOptions['onError'],
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
        bannerConfiguration: PayPalBNPLConfigurationItem,
    ): void {
        const checkout = this.paymentIntegrationService.getState().getCheckoutOrThrow();

        const paypalMessagesOptions: MessagingOptions = {
            amount: checkout.outstandingBalance,
            placement: 'payment',
            style: getPaypalMessagesStylesFromBNPLConfig(bannerConfiguration),
        };

        paypalMessages.Messages(paypalMessagesOptions).render(`#${bannerContainerId}`);
    }
}
