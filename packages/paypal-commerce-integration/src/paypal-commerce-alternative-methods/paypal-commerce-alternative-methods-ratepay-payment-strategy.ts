import { noop, uniqueId } from 'lodash';

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
    WithPayPalCommerceAlternativeMethodsPaymentOptions,
} from './paypal-commerce-alternative-methods-payment-initialize-options';

export default class PayPalCommerceAlternativeMethodsRatepayPaymentStrategy implements PaymentStrategy {
    private clientMetadataId?: string;
    private loadingIndicatorContainer?: string;
    private fundingSource: 'PayUponInvoice';
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
        options: PaymentInitializeOptions & WithPayPalCommerceAlternativeMethodsPaymentOptions,
    ): Promise<void> {
        const {
            gatewayId,
            methodId,
            paypalcommerce,
            paypalcommercealternativemethods,
        } = options;
        const paypalOptions = paypalcommercealternativemethods || paypalcommerce;

        // TODO: remove before merge
        console.log('Ratepay strategy', { gatewayId, methodId });

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

        this.clientMetadataId = uniqueId();
        this.loadingIndicatorContainer = paypalOptions.container.split('#')[1];

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId);
        await this.paypalCommerceIntegrationService.loadPayPalSdk(gatewayId);

        // render legal component
        this.renderLegalText(paypalOptions);
        this.renderFields(paypalOptions);
        // render date of birth field?
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const orderId = await this.paypalCommerceIntegrationService.createOrder(
            'paypalcommercealternativemethodscheckout',
            {
                clientMetadataId: this.clientMetadataId,
            }
        );

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paypalCommerceIntegrationService.submitPayment(payment.methodId, orderId);

        // submit payment one more time in pulling mechanism
        // pulling should be here
        // TODO: add validation

        await this.paypalCommerceIntegrationService.submitPayment(payment.methodId, orderId);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.deinitializePollingMechanism();

        return Promise.resolve();
    }

    private async reinitializeStrategy(
        options: PaymentInitializeOptions & WithPayPalCommerceAlternativeMethodsPaymentOptions,
    ): Promise<void> {
        await this.deinitialize();
        await this.initialize(options);
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
                birthDate: {
                    value: '',
                },
            },
        };

        const paypalPaymentFields = paypalSdk.PaymentFields(fieldsOptions);

        paypalPaymentFields.render(apmFieldsContainer);
    }

    /**
     *
     * Legal methods
     *
     * */
    renderLegalText(paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions) {
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const { apmLegalTextContainer } = paypalOptions;

        if (!apmLegalTextContainer) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercealternativemethods" argument should contain "apmLegalTextContainer".',
            );
        }

        const paypalSdkLegal = paypalSdk.Legal({ fundingSource: this.fundingSource });

        paypalSdkLegal.render("#paypal-legal-container");
    }

    // private async handleClick(
    //     methodId: string,
    //     gatewayId: string,
    //     paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions,
    //     actions: ClickCallbackActions,
    // ): Promise<void> {
    //     const { onValidate } = paypalOptions;
    //     const { resolve, reject } = actions;
    //
    //     if (!this.isNonInstantPaymentMethod(methodId)) {
    //         await this.initializePollingMechanism(methodId, gatewayId, paypalOptions);
    //     }
    //
    //     const onValidationPassed = () => {
    //         this.toggleLoadingIndicator(true);
    //
    //         return resolve();
    //     };
    //
    //     await onValidate(onValidationPassed, reject);
    // }

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
        const { onError } = paypalOptions;

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
                this.resetPollingMechanism();

                // submitPayment

                return;
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
     * Error handling
     *
     * */
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
