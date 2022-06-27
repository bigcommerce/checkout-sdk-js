import { RequestSender } from "@bigcommerce/request-sender";
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
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentRequestOptions,
    PaymentStrategyNew,
    StoreConfig,
} from "@bigcommerce/checkout-sdk/payment-integration";

import ApplePaySessionFactory from "./apple-pay-session-factory";

const validationEndpoint = (bigPayEndpoint: string) =>
    `${bigPayEndpoint}/api/public/v1/payments/applepay/validate_merchant`;

interface ApplePayPromise {
    resolve(
        value:
            | PaymentIntegrationSelectors
            | PromiseLike<PaymentIntegrationSelectors>
    ): void;
    reject(reason?: Error): void;
}

enum DefaultLabels {
    Shipping = "Shipping",
    Subtotal = "Subtotal",
}

export default class ApplePayPaymentStrategy implements PaymentStrategyNew {
    private _shippingLabel: string = DefaultLabels.Shipping;
    private _subTotalLabel: string = DefaultLabels.Subtotal;

    constructor(
        private _requestSender: RequestSender,
        private _paymentIntegrationService: PaymentIntegrationService,
        private _sessionFactory: ApplePaySessionFactory
    ) {}

    async initialize(
        options?: PaymentInitializeOptions
    ): Promise<PaymentIntegrationSelectors> {
        if (!options?.methodId) {
            throw new InvalidArgumentError(
                'Unable to submit payment because "options.methodId" argument is not provided.'
            );
        }
        const { methodId } = options;
        this._shippingLabel =
            options?.applepay?.shippingLabel || DefaultLabels.Shipping;
        this._subTotalLabel =
            options?.applepay?.subtotalLabel || DefaultLabels.Subtotal;
        await this._paymentIntegrationService.loadPaymentMethod(methodId);

        return this._paymentIntegrationService.getState();
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions
    ): Promise<PaymentIntegrationSelectors> {
        const { payment } = payload;
        const state = this._paymentIntegrationService.getState();
        const checkout = state.getCheckoutOrThrow();
        const cart = state.getCartOrThrow();
        const config = state.getStoreConfigOrThrow();

        if (!payment) {
            throw new PaymentArgumentInvalidError(["payment"]);
        }
        const { methodId } = payment;

        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        console.log('state is', paymentMethod);

        const request = this._getBaseRequest(
            cart,
            checkout,
            config,
            paymentMethod
        );
        const applePaySession = this._sessionFactory.create(request);

        await this._paymentIntegrationService.submitOrder(
            {
                useStoreCredit: payload.useStoreCredit,
            },
            options
        );

        console.log('this is called');

        applePaySession.begin();

        console.log('this is called2');

        return new Promise((resolve, reject) => {
            this._handleApplePayEvents(applePaySession, paymentMethod, {
                resolve,
                reject,
            });
        });
    }

    finalize(): Promise<PaymentIntegrationSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<PaymentIntegrationSelectors> {
        return Promise.resolve(this._paymentIntegrationService.getState());
    }

    private _getBaseRequest(
        cart: Cart,
        checkout: Checkout,
        config: StoreConfig,
        paymentMethod: PaymentMethod
    ): ApplePayJS.ApplePayPaymentRequest {
        const {
            storeProfile: { storeCountryCode, storeName },
        } = config;
        const {
            currency: { decimalPlaces },
        } = cart;
        console.log('paymentMethod', paymentMethod);
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
            })
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
                amount: `${checkout.grandTotal.toFixed(
                    cart.currency.decimalPlaces
                )}`,
                type: "final",
            },
        };
    }

    private _handleApplePayEvents(
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod,
        promise: ApplePayPromise
    ) {
        console.log('does it get here?');
        applePaySession.onvalidatemerchant = async (event) => {
            try {
                console.log('lolol')
                const { body: merchantSession } =
                    await this._onValidateMerchant(paymentMethod, event);
                applePaySession.completeMerchantValidation(merchantSession);
            } catch (err) {
                throw new Error("Merchant validation failed");
            }
        };

        applePaySession.oncancel = async () =>
            promise.reject(
                new PaymentMethodCancelledError("Continue with applepay")
            );

        applePaySession.onpaymentauthorized = (
            event: ApplePayJS.ApplePayPaymentAuthorizedEvent
        ) =>
            this._onPaymentAuthorized(
                event,
                applePaySession,
                paymentMethod,
                promise
            );
    }

    private async _onValidateMerchant(
        paymentData: PaymentMethod,
        event: ApplePayJS.ApplePayValidateMerchantEvent
    ) {
        console.log('blah blahj');
        const body = [
            `validationUrl=${event.validationURL}`,
            `merchantIdentifier=${paymentData.initializationData.merchantId}`,
            `displayName=${paymentData.initializationData.storeName}`,
            `domainName=${window.location.hostname}`,
        ].join("&");

        return this._requestSender.post(
            validationEndpoint(paymentData.initializationData.paymentsUrl),
            {
                credentials: false,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-XSRF-TOKEN": null,
                },
                body,
            }
        );
    }

    private async _onPaymentAuthorized(
        event: ApplePayJS.ApplePayPaymentAuthorizedEvent,
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod,
        promise: ApplePayPromise
    ) {
        const { token } = event.payment;
        const payment: Payment = {
            methodId: paymentMethod.id,
            paymentData: {
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

            return promise.resolve(this._paymentIntegrationService.getState());
        } catch (error) {
            applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);

            return promise.reject(
                new NotInitializedError(
                    NotInitializedErrorType.PaymentNotInitialized
                )
            );
        }
    }
}
