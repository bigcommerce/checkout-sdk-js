import { noop } from 'lodash';

import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
    TimeoutError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    BirthDate,
    PayPalCommerceInitializationData,
    PayPalOrderStatus,
} from '../paypal-commerce-types';

import {
    PaypalCommerceRatePay,
    WithPayPalCommerceRatePayPaymentInitializeOptions,
} from './paypal-commerce-ratepay-initialize-options';

const POLLING_INTERVAL = 3000;
const MAX_POLLING_TIME = 300000;

export default class PaypalCommerceRatepayPaymentStrategy implements PaymentStrategy {
    private guid?: string;
    private paypalcommerceratepay?: PaypalCommerceRatePay;
    private loadingIndicatorContainer?: string;
    private pollingTimer = 0;
    private stopPolling = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
        private pollingInterval: number = POLLING_INTERVAL,
        private maxPollingIntervalTime: number = MAX_POLLING_TIME,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithPayPalCommerceRatePayPaymentInitializeOptions,
    ): Promise<void> {
        const { gatewayId, methodId, paypalcommerceratepay } = options;

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

        if (!paypalcommerceratepay) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerceratepay" argument is not provided.`,
            );
        }

        const { legalTextContainer, container, loadingContainerId } = paypalcommerceratepay;

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.container" argument is not provided.`,
            );
        }

        if (!legalTextContainer) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.legalTextContainer" argument is not provided.`,
            );
        }

        if (!loadingContainerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.loadingContainerId" argument is not provided.`,
            );
        }

        this.loadingIndicatorContainer = loadingContainerId;

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
            methodId,
            gatewayId,
        );
        const { merchantId } = paymentMethod.initializationData || {};

        if (!merchantId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because merchantId argument is not provided.`,
            );
        }

        this.paypalcommerceratepay = paypalcommerceratepay;

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.createFraudNetScript(merchantId, methodId, gatewayId);

        this.loadFraudnetConfig();

        this.renderLegalText(legalTextContainer, container);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        const { getFieldsValues } = this.paypalcommerceratepay || {};

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!getFieldsValues || typeof getFieldsValues !== 'function') {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.getFieldsValues" argument is not provided.`,
            );
        }

        this.toggleLoadingIndicator(true);

        try {
            const orderId = await this.paypalCommerceIntegrationService.createOrder(
                'paypalcommercealternativemethodscheckout',
                { metadataId: this.guid },
            );

            const { ratepayBirthDate, ratepayPhoneNumber, ratepayPhoneCountryCode } =
                getFieldsValues();

            const paymentData = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: payment.methodId,
                    rate_pay: {
                        birth_date: this.normalizeDate(ratepayBirthDate),
                        phone: {
                            national_number: ratepayPhoneNumber,
                            country_code: ratepayPhoneCountryCode.split('+')[1],
                        },
                    },
                    paypal_account: {
                        order_id: orderId,
                    },
                },
            };

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData,
            });

            return await new Promise((resolve, reject) => {
                this.initializePollingMechanism(
                    payment.methodId,
                    resolve,
                    reject,
                    payment.gatewayId,
                );
            });
        } catch (error: unknown) {
            this.handleError(error);

            return new Promise((_resolve, reject) => reject());
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        const { legalTextContainer } = this.paypalcommerceratepay || {};
        const fraudNetScript = document.querySelectorAll('[data-id="fraudnetScript"]')[0];
        const fraudNetConfig = document.querySelectorAll('[data-id="fraudnetConfig"]')[0];

        this.deinitializePollingMechanism();

        fraudNetScript.remove();
        fraudNetConfig.remove();

        if (legalTextContainer) {
            const legalTextContainerElement = document.getElementById(legalTextContainer);

            legalTextContainerElement?.remove();
        }

        return Promise.resolve();
    }

    private normalizeDate(date: BirthDate) {
        const formattedDate = this.formatDate(date.getDate());
        const formattedMonth = this.formatDate(date.getMonth() + 1);

        return `${date.getFullYear()}-${formattedMonth}-${formattedDate}`;
    }

    private formatDate(date: number): string {
        return `${date < 10 ? 0 : ''}${date}`;
    }

    private renderLegalText(legalTextContainerElementId: string, container: string) {
        const legalTextContainerId = legalTextContainerElementId;
        const buttonContainerId = container.split('#')[1];
        const buttonContainer = document.getElementById(buttonContainerId);
        const buttonContainerParent = buttonContainer?.parentNode;
        const legalTextContainer = document.createElement('div');

        legalTextContainer.style.marginBottom = '20px';
        legalTextContainer.setAttribute('id', legalTextContainerId);
        buttonContainerParent?.prepend(legalTextContainer);

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const ratePayButton = paypalSdk.Legal({
            fundingSource: paypalSdk.Legal.FUNDING.PAY_UPON_INVOICE,
        });
        const legalTextContainerElement = document.getElementById(legalTextContainerId);

        if (legalTextContainerElement) {
            ratePayButton.render(`#${legalTextContainerId}`);
        } else {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "legalTextContainerElement" argument is not found.`,
            );
        }
    }

    private handleError(error: unknown): void {
        const { onError } = this.paypalcommerceratepay || {};

        this.resetPollingMechanism();
        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    private createFraudNetScript(merchantId: string, methodId: string, gatewayId: string) {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);
        const { testMode } = paymentMethod.config;
        const scriptElement = document.createElement('script');

        scriptElement.setAttribute('type', 'application/json');
        scriptElement.setAttribute('fncls', 'fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99');
        scriptElement.setAttribute('data-id', 'fraudnetScript');
        this.guid = this.generateGUID();

        const fraudNetConfig = {
            f: this.guid,
            s: `${merchantId}_checkout-page`,
            sandbox: testMode,
        };

        scriptElement.innerHTML = JSON.stringify(fraudNetConfig);
        document.body.appendChild(scriptElement);
    }

    private generateGUID() {
        let guid = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 32; i += 1) {
            const randomIndex = Math.floor(Math.random() * characters.length);

            guid += characters[randomIndex];
        }

        return guid;
    }

    private loadFraudnetConfig() {
        const script = document.createElement('script');

        script.setAttribute('data-id', 'fraudnetConfig');
        script.src = 'https://c.paypal.com/da/r/fb.js';
        document.body.appendChild(script);
    }

    private async reinitializeStrategy(
        options: PaymentInitializeOptions & WithPayPalCommerceRatePayPaymentInitializeOptions,
    ): Promise<void> {
        await this.deinitialize();
        await this.initialize(options);
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

            const orderStatus = await this.paypalCommerceIntegrationService.getOrderStatus(
                'paypalcommercealternativemethods',
                {
                    params: {
                        useMetadata: true,
                    },
                },
            );

            const isOrderApproved = orderStatus === PayPalOrderStatus.PollingStop;
            const isPollingError = orderStatus === PayPalOrderStatus.PollingError;

            if (isOrderApproved) {
                this.deinitializePollingMechanism();

                return resolvePromise();
            }

            if (isPollingError) {
                return rejectPromise();
            }

            if (!isOrderApproved && this.pollingTimer < this.maxPollingIntervalTime) {
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
                paypalcommerceratepay: this.paypalcommerceratepay,
            });

            this.handleError(new TimeoutError());
        } catch (error) {
            this.handleError(error);
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
