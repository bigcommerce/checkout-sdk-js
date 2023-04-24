import {
    InvalidArgumentError,
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

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackPayload,
    ClickCallbackActions,
    PayPalCommerceButtons,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
} from '../paypal-commerce-types';

import PayPalCommerceVenmoPaymentInitializeOptions, {
    WithPayPalCommerceVenmoPaymentInitializeOptions,
} from './paypal-commerce-venmo-payment-initialize-options';

export default class PayPalCommerceVenmoPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private paypalButton?: PayPalCommerceButtons;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithPayPalCommerceVenmoPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommerce, paypalcommercevenmo } = options || {};

        const paypalOptions = paypalcommercevenmo || paypalcommerce;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (paypalcommerce) {
            console.warn(
                'The "options.paypalcommerce" option is deprecated for this strategy, please use "options.paypalcommercevenmo" instead',
            );
        }

        if (!paypalOptions) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercevenmo" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (paymentMethod.initializationData?.orderId) {
            this.orderId = paymentMethod.initializationData?.orderId;

            return;
        }

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.loadingIndicatorContainer = paypalOptions.container.split('#')[1];

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
        paypalcommercevenmo: PayPalCommerceVenmoPaymentInitializeOptions,
    ): void {
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { buttonStyle } = paymentMethod.initializationData || {};

        const { container, onError, onRenderButton, onValidate, submitForm } = paypalcommercevenmo;

        const buttonOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.VENMO,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(buttonStyle),
            createOrder: () =>
                this.paypalCommerceIntegrationService.createOrder('paypalcommercevenmocheckout'),
            onClick: (_, actions) => this.handleClick(actions, onValidate),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onCancel: () => this.toggleLoadingIndicator(false),
            onError: (error) => this.handleError(error, onError),
        };

        this.paypalButton = paypalSdk.Buttons(buttonOptions);

        if (!this.paypalButton.isEligible()) {
            return;
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.paypalButton.render(container);
    }

    private async handleClick(
        actions: ClickCallbackActions,
        onValidate: PayPalCommerceVenmoPaymentInitializeOptions['onValidate'],
    ): Promise<void> {
        const { resolve, reject } = actions;

        const onValidationPassed = () => {
            this.toggleLoadingIndicator(true);

            return resolve();
        };

        await onValidate(onValidationPassed, reject);
    }

    private handleApprove(
        { orderID }: ApproveCallbackPayload,
        submitForm: PayPalCommerceVenmoPaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
        this.toggleLoadingIndicator(false);
    }

    private handleError(
        error: Error,
        onError: PayPalCommerceVenmoPaymentInitializeOptions['onError'],
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
}
