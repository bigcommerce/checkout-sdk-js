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

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackPayload,
    BigCommerceButtons,
    BigCommerceButtonsOptions,
    BigCommerceInitializationData,
    ClickCallbackActions,
} from '../big-commerce-types';

import BigCommerceVenmoPaymentInitializeOptions, {
    WithBigCommerceVenmoPaymentInitializeOptions,
} from './big-commerce-venmo-payment-initialize-options';

export default class BigCommerceVenmoPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private bigcommerceButton?: BigCommerceButtons;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithBigCommerceVenmoPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, bigcommerce, bigcommerce_payments_venmo } = options || {};

        const bigcommerceOptions = bigcommerce_payments_venmo || bigcommerce;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerceOptions) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_venmo" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);

        // Info:
        // The BigCommerce button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render BigCommerce button.
        if (paymentMethod.initializationData?.orderId) {
            this.orderId = paymentMethod.initializationData?.orderId;

            return;
        }

        await this.bigCommerceIntegrationService.loadBigCommerceSdk(methodId);

        this.loadingIndicatorContainer = bigcommerceOptions.container.split('#')[1];

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
        bigcommerce_payments_venmo: BigCommerceVenmoPaymentInitializeOptions,
    ): void {
        const bigcommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutPaymentButtonStyles } = paymentButtonStyles || {};

        const { container, onError, onRenderButton, onValidate, submitForm } =
            bigcommerce_payments_venmo;

        const buttonOptions: BigCommerceButtonsOptions = {
            fundingSource: bigcommerceSdk.FUNDING.VENMO,
            style: this.bigCommerceIntegrationService.getValidButtonStyle(
                checkoutPaymentButtonStyles,
            ),
            createOrder: () =>
                this.bigCommerceIntegrationService.createOrder(
                    'bigcommerce_payments_venmocheckout',
                ),
            onClick: (_, actions) => this.handleClick(actions, onValidate),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onCancel: () => this.toggleLoadingIndicator(false),
            onError: (error) => this.handleError(error, onError),
        };

        this.bigcommerceButton = bigcommerceSdk.Buttons(buttonOptions);

        if (!this.bigcommerceButton.isEligible()) {
            throw new NotImplementedError(
                `BigCommerce Venmo is not available for your region. Please use BigCommerce Checkout instead.`,
            );
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.bigcommerceButton.render(container);
    }

    private async handleClick(
        actions: ClickCallbackActions,
        onValidate: BigCommerceVenmoPaymentInitializeOptions['onValidate'],
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
        submitForm: BigCommerceVenmoPaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
        this.toggleLoadingIndicator(false);
    }

    private handleError(
        error: Error,
        onError: BigCommerceVenmoPaymentInitializeOptions['onError'],
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
