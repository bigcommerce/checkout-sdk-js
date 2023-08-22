import { RequestSender } from '@bigcommerce/request-sender';

import { BraintreeIntegrationService } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Cart,
    Checkout,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentRequestOptions,
    PaymentStrategy,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ApplePayGatewayType } from './apple-pay';
import { WithApplePayPaymentInitializeOptions } from './apple-pay-payment-initialize-options';
import ApplePaySessionFactory from './apple-pay-session-factory';

const validationEndpoint = (bigPayEndpoint: string) =>
    `${bigPayEndpoint}/api/public/v1/payments/applepay/validate_merchant`;

interface ApplePayPromise {
    resolve(): void;
    reject(reason?: Error): void;
}

enum DefaultLabels {
    Shipping = 'Shipping',
    Subtotal = 'Subtotal',
}

export default class ApplePayPaymentStrategy implements PaymentStrategy {
    private _shippingLabel: string = DefaultLabels.Shipping;
    private _subTotalLabel: string = DefaultLabels.Subtotal;

    constructor(
        private _requestSender: RequestSender,
        private _paymentIntegrationService: PaymentIntegrationService,
        private _sessionFactory: ApplePaySessionFactory,
        private _braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithApplePayPaymentInitializeOptions,
    ): Promise<void> {
        if (!options?.methodId) {
            throw new InvalidArgumentError(
                'Unable to submit payment because "options.methodId" argument is not provided.',
            );
        }

        const { methodId } = options;

        this._shippingLabel = options.applepay?.shippingLabel || DefaultLabels.Shipping;
        this._subTotalLabel = options.applepay?.subtotalLabel || DefaultLabels.Subtotal;

        const state = await this._paymentIntegrationService.loadPaymentMethod(methodId);

        const paymentMethod: PaymentMethod = state.getPaymentMethodOrThrow(methodId);

        if (paymentMethod.initializationData?.gateway === ApplePayGatewayType.BRAINTREE) {
            await this._paymentIntegrationService.loadPaymentMethod(ApplePayGatewayType.BRAINTREE);
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment } = payload;
        const state = this._paymentIntegrationService.getState();
        const checkout = state.getCheckoutOrThrow();
        const cart = state.getCartOrThrow();
        const config = state.getStoreConfigOrThrow();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;

        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        const request = this._getBaseRequest(cart, checkout, config, paymentMethod);
        const applePaySession = this._sessionFactory.create(request);

        await this._paymentIntegrationService.submitOrder(
            {
                useStoreCredit: payload.useStoreCredit,
            },
            options,
        );

        applePaySession.begin();

        return new Promise((resolve, reject) => {
            this._handleApplePayEvents(applePaySession, paymentMethod, {
                resolve,
                reject,
            });
        });
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _getBaseRequest(
        cart: Cart,
        checkout: Checkout,
        config: StoreConfig,
        paymentMethod: PaymentMethod,
    ): ApplePayJS.ApplePayPaymentRequest {
        const {
            storeProfile: { storeCountryCode, storeName },
        } = config;
        const {
            currency: { decimalPlaces },
        } = cart;
        const {
            initializationData: { merchantCapabilities, supportedNetworks },
        } = paymentMethod;
        const lineItems: ApplePayJS.ApplePayLineItem[] = [
            {
                label: this._subTotalLabel,
                amount: `${checkout.subtotal.toFixed(decimalPlaces)}`,
            },
        ];

        checkout.taxes.forEach((tax) =>
            lineItems.push({
                label: tax.name,
                amount: `${tax.amount.toFixed()}`,
            }),
        );

        lineItems.push({
            label: this._shippingLabel,
            amount: `${checkout.shippingCostTotal.toFixed(decimalPlaces)}`,
        });

        return {
            countryCode: storeCountryCode,
            currencyCode: cart.currency.code,
            merchantCapabilities,
            supportedNetworks,
            lineItems,
            total: {
                label: storeName,
                amount: `${checkout.grandTotal.toFixed(cart.currency.decimalPlaces)}`,
                type: 'final',
            },
        };
    }

    private _handleApplePayEvents(
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod,
        promise: ApplePayPromise,
    ) {
        applePaySession.onvalidatemerchant = async (event) => {
            try {
                const { body: merchantSession } = await this._onValidateMerchant(
                    paymentMethod,
                    event,
                );

                applePaySession.completeMerchantValidation(merchantSession);
            } catch (err) {
                throw new Error('Merchant validation failed');
            }
        };

        applePaySession.oncancel = async () =>
            promise.reject(new PaymentMethodCancelledError('Continue with applepay'));

        applePaySession.onpaymentauthorized = (event: ApplePayJS.ApplePayPaymentAuthorizedEvent) =>
            this._onPaymentAuthorized(event, applePaySession, paymentMethod, promise);
    }

    private async _onValidateMerchant(
        paymentData: PaymentMethod,
        event: ApplePayJS.ApplePayValidateMerchantEvent,
    ) {
        const body = [
            `validationUrl=${event.validationURL}`,
            `merchantIdentifier=${paymentData.initializationData.merchantId}`,
            `displayName=${paymentData.initializationData.storeName}`,
            `domainName=${window.location.hostname}`,
        ].join('&');

        return this._requestSender.post(
            validationEndpoint(paymentData.initializationData.paymentsUrl),
            {
                credentials: false,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-XSRF-TOKEN': null,
                },
                body,
            },
        );
    }

    private async _onPaymentAuthorized(
        event: ApplePayJS.ApplePayPaymentAuthorizedEvent,
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod,
        promise: ApplePayPromise,
    ) {
        const { token } = event.payment;

        let deviceSessionId: string | undefined;

        if (paymentMethod.initializationData?.gateway === ApplePayGatewayType.BRAINTREE) {
            deviceSessionId = await this._getDeviceData();
        }

        const payment: Payment = {
            methodId: paymentMethod.id,
            paymentData: {
                deviceSessionId,
                formattedPayload: {
                    apple_pay_token: {
                        payment_data: token.paymentData,
                        payment_method: token.paymentMethod,
                        transaction_id: token.transactionIdentifier,
                    },
                },
            },
        };

        try {
            await this._paymentIntegrationService.submitPayment(payment);
            applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);

            return promise.resolve();
        } catch (error) {
            applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);

            return promise.reject(
                new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
            );
        }
    }

    private async _getDeviceData() {
        const state = await this._paymentIntegrationService.loadPaymentMethod(
            ApplePayGatewayType.BRAINTREE,
        );

        const braintreePaymentMethod: PaymentMethod = state.getPaymentMethodOrThrow(
            ApplePayGatewayType.BRAINTREE,
        );

        if (!braintreePaymentMethod.clientToken || !braintreePaymentMethod.initializationData) {
            return;
        }

        this._braintreeIntegrationService.initialize(
            braintreePaymentMethod.clientToken,
            braintreePaymentMethod.initializationData,
        );

        const { deviceData } = await this._braintreeIntegrationService.getDataCollector();

        return deviceData;
    }
}
