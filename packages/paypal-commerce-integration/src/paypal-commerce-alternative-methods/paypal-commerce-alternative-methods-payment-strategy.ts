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

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackPayload,
    NonInstantAlternativePaymentMethods,
    PayPalCommerceButtons,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData, PayPalOrderStatus,
} from '../paypal-commerce-types';

import { TimeoutError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceAlternativeMethodsPaymentOptions, {
    WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions,
} from './paypal-commerce-alternative-methods-payment-initialize-options';
import { WithBraintreeLocalMethodsPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/braintree-integration';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

const POLLING_INTERVAL = 3000;
const MAX_POLLING_TIME = 300000;

export default class PayPalCommerceAlternativeMethodsPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private paypalButton?: PayPalCommerceButtons;
    private paypalApms?: PayPalApmSdk;
    private pollingTimer = 0;
    private stopPolling = noop;
    private isPollingEnabled = false;
    private paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsPaymentOptions;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private paypalCommerceSdk: PayPalCommerceSdk,
        private loadingIndicator: LoadingIndicator,
        private pollingInterval: number = POLLING_INTERVAL,
        private maxPollingIntervalTime: number = MAX_POLLING_TIME,
    ) {}

    async initialize(
        options: PaymentInitializeOptions &
            WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions,
    ): Promise<void> {
        const {
            gatewayId,
            methodId,
            paypalcommerce, // FIXME: this option is deprecated
            paypalcommercealternativemethods,
        } = options;
        const paypalOptions = paypalcommercealternativemethods || paypalcommerce;
        this.paypalcommercealternativemethods = paypalcommercealternativemethods;

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
                `Unable to initialize payment because "options.paypalcommercealternativemethods" argument is not provided.`,
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
            methodId,
            gatewayId,
        );
        const { orderId, shouldRenderFields } = paymentMethod.initializationData || {};
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        this.isPollingEnabled = isExperimentEnabled(
            features,
            'PAYPAL-5192.paypal_commerce_ideal_polling',
        );

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (orderId) {
            this.orderId = orderId;

            return;
        }

        this.paypalApms = await this.paypalCommerceSdk.getPayPalApmsSdk(
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

        if (this.isPollingEnabled && methodId === 'ideal') {
            return new Promise((resolve, reject) => {
                void this.initializePollingMechanism(
                    methodId,
                    resolve,
                    reject,
                    gatewayId,
                );
            });
        }

        await this.paypalCommerceIntegrationService.submitPayment(
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

        if (this.isPollingEnabled) {
            this.resetPollingMechanism();
        }

        this.paypalButton?.close();

        return Promise.resolve();
    }

    /**
     *
     * Polling mechanism
     *
     *
     * */
    private async initializePollingMechanism(
        methodId: string,
        resolvePromise: () => void,
        rejectPromise: () => void,
        gatewayId?: string,
    ): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, this.pollingInterval);

            this.stopPolling = () => {
                clearTimeout(timeout);
                this.toggleLoadingIndicator(false);

                return reject();
            };
        });

        try {
            this.pollingTimer += this.pollingInterval;

            const orderStatus = await this.paypalCommerceIntegrationService.getOrderStatus(gatewayId, {
                params: {
                    useMetadata: false,
                },
            });

            const isOrderApproved = orderStatus === PayPalOrderStatus.Approved;
            const isPollingError = orderStatus === PayPalOrderStatus.PollingError;

            if (isOrderApproved) {
                this.deinitializePollingMechanism();

                return resolvePromise();
            }

            if (isPollingError) {
                return rejectPromise();
            }

            if (
                !isOrderApproved &&
                this.pollingTimer < this.maxPollingIntervalTime
            ) {
                return await this.initializePollingMechanism(
                    methodId,
                    resolvePromise,
                    rejectPromise,
                    gatewayId,
                );
            }

            await this.reinitializeStrategy({
                methodId,
                gatewayId,
                paypalcommercealternativemethods: this.paypalcommercealternativemethods,
            });

            this.handleError(new TimeoutError());
        } catch (error) {
            rejectPromise();
        }
    }

    private deinitializePollingMechanism(): void {
        this.stopPolling();
        this.pollingTimer = 0;
    }

    private resetPollingMechanism(): void {
        this.deinitializePollingMechanism();
    }

    private async reinitializeStrategy(
        options: PaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions,
    ) {
        await this.deinitialize();
        await this.initialize(options);
    }

    private handleError(error: unknown) {
        const { onError } = this.paypalcommercealternativemethods || {};

        if (this.isPollingEnabled) {
            this.resetPollingMechanism();
        }

        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton(
        methodId: string,
        gatewayId: string,
        paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions,
    ): void {
        const paypalAmpsSdk = this.getPaypalAmpsSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
            methodId,
            gatewayId,
        );
        const { buttonStyle } = paymentMethod.initializationData || {};

        const { container, onError, onRenderButton, submitForm } = paypalOptions;

        const buttonOptions: PayPalCommerceButtonsOptions = {
            fundingSource: methodId,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(buttonStyle),
            onInit: (_, actions) => paypalOptions.onInitButton(actions),
            createOrder: () => this.onCreateOrder(methodId, gatewayId, paypalOptions),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onCancel: () => this.toggleLoadingIndicator(false),
            onError: (error) => this.handleFailure(error, onError),
            onClick: async (_, actions) =>
                paypalOptions.onValidate(actions.resolve, actions.reject),
        };

        this.paypalButton = paypalAmpsSdk.Buttons(buttonOptions);

        if (!this.paypalButton.isEligible()) {
            return;
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.paypalButton.render(container);
    }

    private async onCreateOrder(
        methodId: string,
        gatewayId: string,
        paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions,
    ): Promise<string> {
        const { onValidate } = paypalOptions;

        const onValidationPassed = () => {
            this.toggleLoadingIndicator(true);

            return () => Promise.resolve();
        };

        await onValidate(onValidationPassed, noop);

        const orderId = await this.paypalCommerceIntegrationService.createOrder(
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
            await this.paypalCommerceIntegrationService.submitPayment(methodId, orderId, gatewayId);
        }

        return orderId;
    }

    private handleApprove(
        { orderID }: ApproveCallbackPayload,
        submitForm: PayPalCommerceAlternativeMethodsPaymentOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
    }

    private handleFailure(
        error: Error,
        onError: PayPalCommerceAlternativeMethodsPaymentOptions['onError'],
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
        paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions,
    ): void {
        const paypalAmpsSdk = this.getPaypalAmpsSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const { firstName, lastName, email } = state.getBillingAddressOrThrow();

        const { apmFieldsContainer, apmFieldsStyles } = paypalOptions;

        if (!apmFieldsContainer) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercealternativemethods" argument should contain "apmFieldsContainer".',
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
