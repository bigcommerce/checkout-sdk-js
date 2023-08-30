import { noop } from 'lodash';

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
    TimeoutError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackPayload,
    ClickCallbackActions,
    NonInstantAlternativePaymentMethods,
    PayPalCommerceButtons,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
    PayPalOrderStatus,
} from '../paypal-commerce-types';

import PayPalCommerceAlternativeMethodsPaymentOptions, {
    WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions,
} from './paypal-commerce-alternative-methods-payment-initialize-options';

export default class PayPalCommerceAlternativeMethodsPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private paypalButton?: PayPalCommerceButtons;
    private pollingTimer = 0;
    private stopPolling = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
        private pollingInterval = 3000,
        private maxPollingTime = 600000,
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

        if (paypalcommerce) {
            console.warn(
                'The "options.paypalcommerce" option is deprecated for this strategy, please use "options.paypalcommercealternativemethods" instead',
            );
        }

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

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (orderId) {
            this.orderId = orderId;

            return;
        }

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

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

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        if (!this.isNonInstantPaymentMethod(payment.methodId)) {
            await this.paymentIntegrationService.submitOrder(order, options);
        }

        await this.paypalCommerceIntegrationService.submitPayment(payment.methodId, this.orderId);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.deinitializePollingMechanism();

        this.orderId = undefined;

        this.paypalButton?.close();

        return Promise.resolve();
    }

    private async reinitializeStrategy(
        options: PaymentInitializeOptions &
            WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions,
    ): Promise<void> {
        await this.deinitialize();
        await this.initialize(options);
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
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

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
            createOrder: () => this.handleCreateOrder(methodId, gatewayId),
            onClick: (_, actions) => this.handleClick(methodId, gatewayId, paypalOptions, actions),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onCancel: () => this.resetPollingMechanism(),
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

    private async handleCreateOrder(methodId: string, gatewayId: string): Promise<string> {
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
            await this.paypalCommerceIntegrationService.submitPayment(methodId, orderId);
        }

        return orderId;
    }

    private async handleClick(
        methodId: string,
        gatewayId: string,
        paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions,
        actions: ClickCallbackActions,
    ): Promise<void> {
        const { onValidate } = paypalOptions;
        const { resolve, reject } = actions;

        if (!this.isNonInstantPaymentMethod(methodId)) {
            await this.initializePollingMechanism(methodId, gatewayId, paypalOptions);
        }

        const onValidationPassed = () => {
            this.toggleLoadingIndicator(true);

            return resolve();
        };

        await onValidate(onValidationPassed, reject);
    }

    private handleApprove(
        { orderID }: ApproveCallbackPayload,
        submitForm: PayPalCommerceAlternativeMethodsPaymentOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        this.deinitializePollingMechanism();
        submitForm();
        this.toggleLoadingIndicator(false);
    }

    private handleError(
        error: Error,
        onError: PayPalCommerceAlternativeMethodsPaymentOptions['onError'],
    ): void {
        this.resetPollingMechanism();

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
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
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

        const paypalPaymentFields = paypalSdk.PaymentFields(fieldsOptions);

        paypalPaymentFields.render(apmFieldsContainer);
    }

    /**
     *
     * Polling mechanism
     *
     *
     * */
    private async initializePollingMechanism(
        methodId: string,
        gatewayId: string,
        paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions,
    ): Promise<void> {
        const { onError, submitForm } = paypalOptions;

        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, this.pollingInterval);

            this.stopPolling = () => {
                clearTimeout(timeout);
                reject();
            };
        });

        try {
            this.pollingTimer += this.pollingInterval;

            const orderStatus = await this.paypalCommerceIntegrationService.getOrderStatus();

            const isOrderApproved = orderStatus === PayPalOrderStatus.Approved;
            const isOrderPending =
                orderStatus === PayPalOrderStatus.Created ||
                orderStatus === PayPalOrderStatus.PayerActionRequired;

            if (isOrderApproved) {
                this.deinitializePollingMechanism();

                return submitForm();
            }

            if (isOrderPending && this.pollingTimer < this.maxPollingTime) {
                return await this.initializePollingMechanism(methodId, gatewayId, paypalOptions);
            }

            await this.reinitializeStrategy({
                methodId,
                gatewayId,
                paypalcommercealternativemethods: paypalOptions,
            });

            throw new TimeoutError();
        } catch (error) {
            this.handleError(error, onError);
        }
    }

    private deinitializePollingMechanism(): void {
        this.stopPolling();
        this.pollingTimer = 0;
    }

    private resetPollingMechanism(): void {
        this.deinitializePollingMechanism();
        this.toggleLoadingIndicator(false);
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
}
