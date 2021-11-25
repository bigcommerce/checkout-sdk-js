import { RequestSender } from '@bigcommerce/request-sender';
​
import { PaymentStrategy } from '..';
import { Payment, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator, PaymentRequestOptions } from '../..';
import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import ApplePaySessionFactory from './apple-pay-session-factory';
​
import { assertApplePayWindow } from './is-apple-pay-window';

export const validationEndpoint = 'https://bigpay.service.bcdev/api/public/v1/payments/applepay/validate_merchant';
const appleValidationUrl = 'https://apple-pay-gateway-cert.apple.com/paymentservices/startSession';

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
        const cart = state.cart.getCartOrThrow();
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const request = this._getBaseRequest(cart);
        const applePaySession = this._sessionFactory.create(request);
​
        const { methodId } = payment;
        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId, options)
        );

        const paymentMethod = getPaymentMethodOrThrow(methodId);

        await this._store.dispatch(this._orderActionCreator.submitOrder({}, options));
​
        assertApplePayWindow(window);
​
        applePaySession.begin();
​
        // Applepay will handle the rest of the flow so return a promise that doesn't really resolve
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
    private _getBaseRequest(cart: Cart): ApplePayJS.ApplePayPaymentRequest {
        return {
            countryCode: 'US',
            currencyCode: cart.currency.code,
            merchantCapabilities: ['supports3DS'],
            supportedNetworks: [
                'visa',
                'masterCard',
                'amex',
                'discover'
            ],
            lineItems: [],
            total: {
                label: 'Total',
                amount: `${cart.cartAmount.toFixed(cart.currency.decimalPlaces)}`,
                type: 'final',
            },
        };
    }
​
    private _handleApplePayEvents(applePaySession: ApplePaySession, paymentMethod: PaymentMethod, promise: ApplePayPromise) {
        applePaySession.onvalidatemerchant = async () => {
            try {
                const { body: merchantSession } = await this._onValidateMerchant(paymentMethod);
                applePaySession.completeMerchantValidation(merchantSession);
            } catch (err) {
                throw new Error('Merchant validation failed');
            }
        };
​
        applePaySession.oncancel = async () =>
            promise.reject(new PaymentMethodCancelledError('Continue with applepay'));
​
        applePaySession.onpaymentauthorized = async (event: ApplePayJS.ApplePayPaymentAuthorizedEvent) => {
            this._onPaymentAuthorized(event, applePaySession, paymentMethod, promise.resolve);
        };
    }
​
    private async _onValidateMerchant(paymentData: PaymentMethod) {
        const body = [
            `validationUrl=${appleValidationUrl}`,
            `merchantIdentifier=${paymentData.initializationData.merchantId}`,
            `displayName=${paymentData.initializationData.storeName}`,
            `domainName=${window.location.hostname}`,
        ].join('&');
​
        return this._requestSender.post(validationEndpoint, {
            credentials: false,
            headers: {
                'Accept': 'application/json',
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
        resolve: ApplePayPromise['resolve']
    ) {
        const { token } = event.payment;
        const payment: Payment = {
            methodId: paymentMethod.id,
            paymentData: {
                formattedPayload: {
                    apple_pay_token: {
                        payment_data: token.paymentData,
                        payment_method: token.paymentMethod,
                        transaction_id: token.transactionIdentifier
                    },
                },
            },
        };

        return this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            .then(() => {
                applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);

                return resolve(this._store.getState());
            })
            .catch(() => {
                applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);
            });
    }
}
