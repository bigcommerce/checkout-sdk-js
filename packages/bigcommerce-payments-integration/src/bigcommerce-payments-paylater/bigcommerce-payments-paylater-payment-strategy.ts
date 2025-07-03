import {
    BigCommercePaymentsInitializationData,
    getPaypalMessagesStylesFromBNPLConfig,
    MessagingOptions,
    PayPalBNPLConfigurationItem,
    PayPalMessagesSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
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
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    ApproveCallbackPayload,
    BigCommercePaymentsButtons,
    BigCommercePaymentsButtonsOptions,
    ClickCallbackActions,
} from '../bigcommerce-payments-types';

import BigCommercePaymentsPayLaterPaymentInitializeOptions, {
    WithBigCommercePaymentsPayLaterPaymentInitializeOptions,
} from './bigcommerce-payments-paylater-payment-initialize-options';

export default class BigCommercePaymentsPayLaterPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private bigCommercePaymentsButtons?: BigCommercePaymentsButtons;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService,
        private loadingIndicator: LoadingIndicator,
        private paypalSdkHelper: PayPalSdkHelper,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions &
            WithBigCommercePaymentsPayLaterPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, bigcommerce_payments_paylater } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerce_payments_paylater) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_paylater" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);
        const { paypalBNPLConfiguration = [], orderId } = paymentMethod.initializationData || {};
        const { bannerContainerId = '', container } = bigcommerce_payments_paylater;

        if (document.getElementById(bannerContainerId)) {
            const bannerConfiguration =
                paypalBNPLConfiguration &&
                paypalBNPLConfiguration.find(({ id }) => id === 'checkout');

            if (!bannerConfiguration?.status) {
                return;
            }

            const paypalMessages = await this.paypalSdkHelper.getPayPalMessages(
                paymentMethod,
                state.getCartOrThrow().currency.code,
            );

            return this.renderMessages(paypalMessages, bannerContainerId, bannerConfiguration);
        }

        // Info:
        // The BigCommercePayments button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render BigCommercePayments button.
        if (orderId) {
            this.orderId = orderId;

            return;
        }

        await this.bigCommercePaymentsIntegrationService.loadPayPalSdk(methodId);

        this.loadingIndicatorContainer = container?.split('#')[1];

        this.renderButton(methodId, bigcommerce_payments_paylater);
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
        await this.bigCommercePaymentsIntegrationService.submitPayment(
            payment.methodId,
            this.orderId,
        );
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.orderId = undefined;

        this.bigCommercePaymentsButtons?.close();

        return Promise.resolve();
    }

    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton(
        methodId: string,
        bigcommerce_payments_paylater: BigCommercePaymentsPayLaterPaymentInitializeOptions,
    ): void {
        if (!bigcommerce_payments_paylater?.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "container" argument is not provided.',
            );
        }

        const bigCommerceSdk = this.bigCommercePaymentsIntegrationService.getPayPalSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutPaymentButtonStyles } = paymentButtonStyles || {};

        const { container, onError, onRenderButton, onValidate, submitForm } =
            bigcommerce_payments_paylater;

        const fundingSources = [bigCommerceSdk.FUNDING.PAYLATER, bigCommerceSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (hasRenderedSmartButton) {
                return;
            }

            const buttonOptions: BigCommercePaymentsButtonsOptions = {
                fundingSource,
                style: this.bigCommercePaymentsIntegrationService.getValidButtonStyle(
                    checkoutPaymentButtonStyles,
                ),
                createOrder: () =>
                    this.bigCommercePaymentsIntegrationService.createOrder(
                        'bigcommerce_payments_paylater',
                    ),
                onClick: (_, actions) => this.handleClick(actions, onValidate),
                onApprove: (data) => this.handleApprove(data, submitForm),
                onCancel: () => this.toggleLoadingIndicator(false),
                onError: (error) => this.handleError(error, onError),
            };

            this.bigCommercePaymentsButtons = bigCommerceSdk.Buttons(buttonOptions);

            if (
                !this.bigCommercePaymentsButtons.isEligible() &&
                fundingSource === bigCommerceSdk.FUNDING.PAYLATER
            ) {
                return;
            }

            if (
                !this.bigCommercePaymentsButtons.isEligible() &&
                fundingSource === bigCommerceSdk.FUNDING.CREDIT
            ) {
                throw new NotImplementedError(
                    `BigCommercePayments ${fundingSource} is not available for your region. Please use BigCommercePayments Checkout instead.`,
                );
            }

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            this.bigCommercePaymentsButtons.render(container);
            hasRenderedSmartButton = true;
        });
    }

    private async handleClick(
        actions: ClickCallbackActions,
        onValidate: BigCommercePaymentsPayLaterPaymentInitializeOptions['onValidate'],
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
        submitForm: BigCommercePaymentsPayLaterPaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        if (submitForm && typeof submitForm === 'function') {
            submitForm();
        }
    }

    private handleError(
        error: Error,
        onError: BigCommercePaymentsPayLaterPaymentInitializeOptions['onError'],
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
