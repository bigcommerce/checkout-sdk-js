import { noop } from 'lodash';

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
import { PayPalApmSdk, PayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
// TODO: remove this import after implementing bigcommerce-utils
import PayPalCommerceIntegrationService from 'packages/paypal-commerce-integration/src/paypal-commerce-integration-service';
// TODO: remove this import after implementing bigcommerce-utils
import {
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
} from 'packages/paypal-commerce-integration/src/paypal-commerce-types';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackPayload,
    BigCommerceButtons,
    // BigCommerceButtonsOptions,
    //BigCommerceInitializationData,
    NonInstantAlternativePaymentMethods,
} from '../big-commerce-types';

import BigCommerceAlternativeMethodsPaymentOptions, {
    WithBigCommerceAlternativeMethodsPaymentInitializeOptions,
} from './big-commerce-alternative-methods-payment-initialize-options';

export default class BigCommerceAlternativeMethodsPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private bigCommerceButton?: BigCommerceButtons;
    private paypalApms?: PayPalApmSdk;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private paypalCommerceSdk: PayPalCommerceSdk,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options: PaymentInitializeOptions &
            WithBigCommerceAlternativeMethodsPaymentInitializeOptions,
    ): Promise<void> {
        const {
            gatewayId,
            methodId,
            bigcommerce, // FIXME: this option is deprecated
            bigcommercealternativemethods,
        } = options;
        const bigcommerceOptions = bigcommercealternativemethods || bigcommerce;

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

        if (!bigcommerceOptions) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommercealternativemethods" argument is not provided.`,
            );
        }

        const state = this.paymentIntegrationService.getState();
        // TODO: replace with paymentMethod = state.getPaymentMethodOrThrow<BigCommerceInitializationData>
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
            methodId,
            gatewayId,
        );
        const { orderId, shouldRenderFields } = paymentMethod.initializationData || {};

        // Info:
        // The BigCommerce button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render BigCommerce button.
        if (orderId) {
            this.orderId = orderId;

            return;
        }

        // TODO: should use getBigCommerceApmsSdk from bigcommecse-utils
        this.paypalApms = await this.paypalCommerceSdk.getPayPalApmsSdk(
            paymentMethod,
            state.getCartOrThrow().currency.code,
        );

        this.loadingIndicatorContainer = bigcommerceOptions.container.split('#')[1];

        this.renderButton(methodId, gatewayId, bigcommerceOptions);

        if (shouldRenderFields) {
            this.renderFields(methodId, bigcommerceOptions);
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

        await this.bigCommerceIntegrationService.submitPayment(methodId, this.orderId, gatewayId);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.orderId = undefined;

        this.bigCommerceButton?.close();

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
        bigcommerceOptions: BigCommerceAlternativeMethodsPaymentOptions,
    ): void {
        const paypalAmpsSdk = this.getPaypalAmpsSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        // TODO: replace with  BigCommerceInitializationData
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
            methodId,
            gatewayId,
        );
        const { buttonStyle } = paymentMethod.initializationData || {};

        const { container, onError, onRenderButton, submitForm } = bigcommerceOptions;

        // TODO: replace with buttonOptions: BigCommerceButtonsOptions
        const buttonOptions: PayPalCommerceButtonsOptions = {
            fundingSource: methodId,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(buttonStyle),
            onInit: (_, actions) => bigcommerceOptions.onInitButton(actions),
            createOrder: () => this.onCreateOrder(methodId, gatewayId, bigcommerceOptions),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onCancel: () => this.toggleLoadingIndicator(false),
            onError: (error) => this.handleFailure(error, onError),
            onClick: async (_, actions) =>
                bigcommerceOptions.onValidate(actions.resolve, actions.reject),
        };

        this.bigCommerceButton = paypalAmpsSdk.Buttons(buttonOptions);

        if (!this.bigCommerceButton.isEligible()) {
            return;
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.bigCommerceButton.render(container);
    }

    private async onCreateOrder(
        methodId: string,
        gatewayId: string,
        bigcommerceOptions: BigCommerceAlternativeMethodsPaymentOptions,
    ): Promise<string> {
        const { onValidate } = bigcommerceOptions;

        const onValidationPassed = () => {
            this.toggleLoadingIndicator(true);

            return () => Promise.resolve();
        };

        await onValidate(onValidationPassed, noop);

        const orderId = await this.bigCommerceIntegrationService.createOrder(
            'paypalcommercealternativemethodscheckout',
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
            await this.bigCommerceIntegrationService.submitPayment(methodId, orderId, gatewayId);
        }

        return orderId;
    }

    private handleApprove(
        { orderID }: ApproveCallbackPayload,
        submitForm: BigCommerceAlternativeMethodsPaymentOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
    }

    private handleFailure(
        error: Error,
        onError: BigCommerceAlternativeMethodsPaymentOptions['onError'],
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
        bigcommerceOptions: BigCommerceAlternativeMethodsPaymentOptions,
    ): void {
        const paypalAmpsSdk = this.getPaypalAmpsSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const { firstName, lastName, email } = state.getBillingAddressOrThrow();

        const { apmFieldsContainer, apmFieldsStyles } = bigcommerceOptions;

        if (!apmFieldsContainer) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommercealternativemethods" argument should contain "apmFieldsContainer".',
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
