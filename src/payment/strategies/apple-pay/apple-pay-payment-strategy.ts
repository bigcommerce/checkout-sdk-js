import { RequestSender } from '@bigcommerce/request-sender';

import { Cart } from '../../../cart';​
import { Checkout, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { StoreConfig } from '../../../config';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import ApplePaySessionFactory from './apple-pay-session-factory';
import { assertApplePayWindow } from './is-apple-pay-window';

const validationEndpoint = (bigPayEndpoint: string) => `${bigPayEndpoint}/api/public/v1/payments/applepay/validate_merchant`;

interface ApplePayPromise {
    resolve(value: InternalCheckoutSelectors | PromiseLike<InternalCheckoutSelectors>): void;
    reject(reason?: Error): void;
}
​
export default class ApplePayPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _requestSender: RequestSender,
        private _orderActionCreator: OrderActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _sessionFactory: ApplePaySessionFactory
    ) { }
​
    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
​
    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;
        const state = this._store.getState();
        const checkout = state.checkout.getCheckoutOrThrow();
        const cart = state.cart.getCartOrThrow();
        const config = state.config.getStoreConfigOrThrow();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const request = this._getBaseRequest(cart, checkout, config);
        assertApplePayWindow(window);
        const applePaySession = this._sessionFactory.create(request);
​
        const { methodId } = payment;
        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId, options)
        );

        const paymentMethod = getPaymentMethodOrThrow(methodId);

        await this._store.dispatch(this._orderActionCreator.submitOrder(
            {
                useStoreCredit: payload.useStoreCredit,
            }, options)
        );
​
        applePaySession.begin();
​
        return new Promise((resolve, reject) => {
            this._handleApplePayEvents(applePaySession, paymentMethod, { resolve, reject });
        });
    }
​
    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }
​
    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
​
    private _getBaseRequest(cart: Cart, checkout: Checkout, config: StoreConfig): ApplePayJS.ApplePayPaymentRequest {
        const { storeProfile: { storeCountryCode, storeName } } = config;
        let lineItems: ApplePayJS.ApplePayLineItem[] = [
            { label: 'Sub total', amount: `${checkout.subtotal.toFixed(cart.currency.decimalPlaces)}`},
        ];

        checkout.taxes.forEach(tax =>
            lineItems.push({ label: tax.name, amount: `${tax.amount}` }));

        lineItems.push({ label: 'Shipping', amount: `${checkout.shippingCostTotal}`});

        return {
            countryCode: storeCountryCode,
            currencyCode: cart.currency.code,
            merchantCapabilities: ['supports3DS'],
            supportedNetworks: [
                'visa',
                'masterCard',
                'amex',
                'discover',
            ],
            lineItems,
            total: {
                label: storeName,
                amount: `${checkout.grandTotal.toFixed(cart.currency.decimalPlaces)}`,
                type: 'final',
            },
        };
    }
​
    private _handleApplePayEvents(applePaySession: ApplePaySession, paymentMethod: PaymentMethod, promise: ApplePayPromise) {
        applePaySession.onvalidatemerchant = async event => {
            try {
                const { body: merchantSession } = await this._onValidateMerchant(paymentMethod, event);
                applePaySession.completeMerchantValidation(merchantSession);
            } catch (err) {
                throw new Error('Merchant validation failed');
            }
        };
​
        applePaySession.oncancel = async () =>
            promise.reject(new PaymentMethodCancelledError('Continue with applepay'));
​
        applePaySession.onpaymentauthorized = (event: ApplePayJS.ApplePayPaymentAuthorizedEvent) =>
            this._onPaymentAuthorized(event, applePaySession, paymentMethod, promise);
    }
​
    private async _onValidateMerchant(paymentData: PaymentMethod, event: ApplePayJS.ApplePayValidateMerchantEvent) {
        const body = [
            `validationUrl=${event.validationURL}`,
            `merchantIdentifier=${paymentData.initializationData.merchantId}`,
            `displayName=${paymentData.initializationData.storeName}`,
            `domainName=${window.location.hostname}`,
        ].join('&');
​
        return this._requestSender.post(validationEndpoint(paymentData.initializationData.paymentsUrl), {
            credentials: false,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-XSRF-TOKEN': null,
            },
            body,
        });
    }
​
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
            await this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
            applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);

            return promise.resolve(this._store.getState());;
        } catch(error) {
            applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);

            return promise.reject(new Error('Payment failed'));
        }
    }
}
