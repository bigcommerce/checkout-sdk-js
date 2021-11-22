import { RequestSender } from '@bigcommerce/request-sender';
​
import { PaymentStrategy } from '..';
import { Payment, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator, PaymentRequestOptions } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { Order, OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
​
import { assertApplePayWindow } from './is-apple-pay-window';
​
export default class ApplePayPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _requestSender: RequestSender,
        private _orderActionCreator: OrderActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) { }
​
    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
​
    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;
        const state = this._store.getState();
        const order = state.order.getOrderOrThrow();
        const request = this._getBaseRequest(order);
        const applePaySession = new ApplePaySession(1, request);
​
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }
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
        return new Promise((_, reject) => {
            this._handleApplePayEvents(applePaySession, paymentMethod, order, reject);
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
    private _getBaseRequest(order: Order): ApplePayJS.ApplePayPaymentRequest {
        return {
            countryCode: 'US',
            currencyCode: 'USD',
            merchantCapabilities: ['supports3DS'],
            supportedNetworks: [
                'visa',
                'masterCard',
                'amex',
                'discover'
            ],
            lineItems: [
                {
                    label: order.taxes[0].name,
                    amount: `${order.taxes[0].amount}`,
                },
                {
                    label: 'Shipping',
                    amount: `${order.shippingCostTotal}`,
                },
            ],
            total: {
                label: 'Total',
                amount: `${order.orderAmount}`,
                type: 'final',
            },
        };
    }
​
    private _handleApplePayEvents(applePaySession: ApplePaySession, paymentMethod: PaymentMethod, order: Order, reject: any) {
        applePaySession.onvalidatemerchant = async () => {
            try {
                const { body: merchantSession } = await this._onValidateMerchant(paymentMethod);
                applePaySession.completeMerchantValidation(merchantSession);
            } catch (err) {
                throw new Error('Merchant validation failed');
            }
        };
​
        applePaySession.oncancel = async () => {
            reject(new PaymentMethodCancelledError('Continue with applepay'));
        };
​
        // Implement callback onpaymentmethodselected
        // Figure out how to select different card
​
​
        applePaySession.onpaymentauthorized = async (event: ApplePayJS.ApplePayPaymentAuthorizedEvent) => {
            this._onPaymentAuthorized(applePaySession, event, order, paymentMethod);
        };
    }
​
    private async _onValidateMerchant(paymentData: PaymentMethod) {
        const endpoint = 'https://bigpay.service.bcdev/api/public/v1/payments/applepay/validate_merchant';
        const appleValidationUrl = 'https://apple-pay-gateway-cert.apple.com/paymentservices/startSession';
        const body = [
            `validationUrl=${appleValidationUrl}`,
            `merchantIdentifier=${paymentData.initializationData.merchantId}`,
            `displayName=${paymentData.initializationData.storeName}`,
            `domainName=${window.location.hostname}`,
        ].join('&');
​
        return this._requestSender.post(endpoint, {
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
    private async _onPaymentAuthorized(applePaySession: ApplePaySession, event: ApplePayJS.ApplePayPaymentAuthorizedEvent, order: Order, paymentMethod: PaymentMethod) {
        console.log('in payment authorized', event, paymentMethod, order);
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
        }

        try {
            await this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
        } catch (err) {
            console.log(err);
        }
​
        if ( true ) {
            // payment sheet will be hidden
            applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);
            // window.location.replace(redirectUrl);
        } else {
            // payment sheet will be hidden even if failure
            applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);
        }
​
        // var payload = {
        //     useStoreCredit: false,
        //     payment: {
        //         name: ApplePay.settings.gateway,
        //         paymentData: {
        //             applePayToken: e.payment.token
        //         }
        //     },
        // };
​
        // ApplePay.request('POST', ApplePay.LEGACY_CHECKOUT_ENDPOINT + '/order', payload).then(function () {
        //     session.completePayment(ApplePaySession.STATUS_SUCCESS);
        //     window.location = ApplePay.settings.confirmationLink;
        // }, function (err) {
        //     var safePayment = e.payment;
        //     safePayment.token = 'redacted';
        //     ApplePay.log('error', 'order creation and payment failed', {
        //         payment: safePayment,
        //         response: err
        //     });
        //     session.completePayment(ApplePay.appleStatusForFailedResponse(err));
        // });
    }
}
