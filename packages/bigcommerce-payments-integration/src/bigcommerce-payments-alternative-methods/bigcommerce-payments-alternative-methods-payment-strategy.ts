import { noop } from 'lodash';

import {
    PayPalApmSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
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
    BigCommercePaymentsInitializationData,
    NonInstantAlternativePaymentMethods,
} from '../bigcommerce-payments-types';

import BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions, {
    WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions,
} from './bigcommerce-payments-alternative-methods-payment-initialize-options';

export default class BigCommercePaymentsAlternativeMethodsPaymentStrategy
    implements PaymentStrategy
{
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private bigCommercePaymentsButton?: BigCommercePaymentsButtons;
    private paypalApms?: PayPalApmSdk;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService,
        private bigCommercePaymentsSdkHelper: PayPalSdkHelper,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options: PaymentInitializeOptions &
            WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions,
    ): Promise<void> {
        const {
            gatewayId,
            methodId,
            bigcommerce_payments_paypal, // FIXME: this option is deprecated
            bigcommerce_payments_apms,
        } = options;
        const paypalOptions = bigcommerce_payments_apms || bigcommerce_payments_paypal;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.gatewayId" argument is not provided.',
            );
        }

        if (!paypalOptions) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_apms" argument is not provided.`,
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(
            methodId,
            gatewayId,
        );
        const { orderId, shouldRenderFields } = paymentMethod.initializationData || {};

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (orderId) {
            this.orderId = orderId;

            return;
        }

        this.paypalApms = await this.bigCommercePaymentsSdkHelper.getPayPalApmsSdk(
            paymentMethod,
            state.getCartOrThrow().currency.code,
        );

        this.loadingIndicatorContainer = paypalOptions.container.split('#')[1];

        this.renderButton(methodId, gatewayId, paypalOptions);

        if (shouldRenderFields) {
            this.renderFields(methodId, paypalOptions);
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, gatewayId } = payment;

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        if (!this.isNonInstantPaymentMethod(methodId)) {
            await this.paymentIntegrationService.submitOrder(order, options);
        }

        await this.bigCommercePaymentsIntegrationService.submitPayment(
            methodId,
            this.orderId,
            gatewayId,
        );
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.orderId = undefined;

        this.bigCommercePaymentsButton?.close();

        return Promise.resolve();
    }

    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton(
        methodId: string,
        gatewayId: string,
        paypalOptions: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions,
    ): void {
        const paypalAmpsSdk = this.getPaypalAmpsSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(
            methodId,
            gatewayId,
        );
        const { buttonStyle } = paymentMethod.initializationData || {};

        const { container, onError, onRenderButton, submitForm } = paypalOptions;

        const buttonOptions: BigCommercePaymentsButtonsOptions = {
            fundingSource: methodId,
            style: this.bigCommercePaymentsIntegrationService.getValidButtonStyle(buttonStyle),
            onInit: (_, actions) => paypalOptions.onInitButton(actions),
            createOrder: () => this.onCreateOrder(methodId, gatewayId, paypalOptions),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onCancel: () => this.toggleLoadingIndicator(false),
            onError: (error) => this.handleFailure(error, onError),
            onClick: async (_, actions) =>
                paypalOptions.onValidate(actions.resolve, actions.reject),
        };

        this.bigCommercePaymentsButton = paypalAmpsSdk.Buttons(buttonOptions);

        if (!this.bigCommercePaymentsButton.isEligible()) {
            return;
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.bigCommercePaymentsButton.render(container);
    }

    private async onCreateOrder(
        methodId: string,
        gatewayId: string,
        paypalOptions: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions,
    ): Promise<string> {
        const { onValidate } = paypalOptions;

        const onValidationPassed = () => {
            this.toggleLoadingIndicator(true);

            return () => Promise.resolve();
        };

        await onValidate(onValidationPassed, noop);

        const orderId = await this.bigCommercePaymentsIntegrationService.createOrder(
            'bigcommerce_payments_apms',
        );

        if (this.isNonInstantPaymentMethod(methodId)) {
            const order = { useStoreCredit: false };
            const options = {
                params: {
                    methodId,
                    gatewayId,
                },
            };

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.bigCommercePaymentsIntegrationService.submitPayment(
                methodId,
                orderId,
                gatewayId,
            );
        }

        return orderId;
    }

    private handleApprove(
        { orderID }: ApproveCallbackPayload,
        submitForm: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
    }

    private handleFailure(
        error: Error,
        onError: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions['onError'],
    ): void {
        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    /**
     *
     * Fields methods
     *
     * */
    private renderFields(
        methodId: string,
        paypalOptions: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions,
    ): void {
        const paypalAmpsSdk = this.getPaypalAmpsSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const { firstName, lastName, email } = state.getBillingAddressOrThrow();

        const { apmFieldsContainer, apmFieldsStyles } = paypalOptions;

        if (!apmFieldsContainer) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_apms" argument should contain "apmFieldsContainer".',
            );
        }

        const fieldContainerElement = document.querySelector(apmFieldsContainer);

        if (fieldContainerElement) {
            fieldContainerElement.innerHTML = '';
        }

        const fieldsOptions = {
            fundingSource: methodId,
            style: apmFieldsStyles || {},
            fields: {
                name: {
                    value: `${firstName} ${lastName}`,
                },
                email: {
                    value: email,
                },
            },
        };

        const paypalPaymentFields = paypalAmpsSdk.PaymentFields(fieldsOptions);

        paypalPaymentFields.render(apmFieldsContainer);
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
     * Utils
     *
     * */
    private isNonInstantPaymentMethod(methodId: string): boolean {
        return methodId.toUpperCase() in NonInstantAlternativePaymentMethods;
    }

    private getPaypalAmpsSdkOrThrow() {
        if (!this.paypalApms) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalApms;
    }
}
