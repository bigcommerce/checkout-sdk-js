import {NotInitializedError, NotInitializedErrorType} from '../../../common/error/errors';
import {StripeScriptLoader, StripeSDK} from '../stripe';

export default class ThreeDSecureProcessor {
    private _stripeSdk?: StripeSDK;
    constructor(
        private _stripeScriptLoader: StripeScriptLoader
    ) {}

    doPayment(paymentRequest: any) {
        return new Promise((resolve, reject) => {
            return this._stripeScriptLoader.load()
                .then((stripeSdk: StripeSDK) => {
                    this._stripeSdk = stripeSdk;

                    return this._stripeSdk.source.create({
                        type: 'card',
                        card: {
                            number: '4000000000003063',
                            cvc: '123',
                            exp_month: '12',
                            exp_year: '2020',
                        },
                    }, this.create3DSecure(paymentRequest, resolve, reject));
                });
        });
    }

    create3DSecure(paymentRequest: any, resolve: any, reject: any) {
        return (status: any, cardResponse: any) => {
            if (status !== 200 || cardResponse.error) {  // problem
                reject(cardResponse.error);
            } else if (cardResponse.card.three_d_secure === 'not_supported' && cardResponse.status === 'chargeable') {
                resolve(cardResponse);
            } else if (cardResponse.card.three_d_secure === 'optional' || cardResponse.card.three_d_secure === 'required') {
                const onCreate3DSecureCallback = this.createIframe(paymentRequest, resolve, reject);
                if (!this._stripeSdk) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                this._stripeSdk.source.create({
                    type: 'three_d_secure',
                    amount: '1099',
                    currency: 'USD',
                    three_d_secure: { card: cardResponse.id },
                    redirect: {
                        return_url: window.location.href,
                    },
                }, onCreate3DSecureCallback);
            } else {
                reject(cardResponse);
            }
        };
    }

    createIframe(paymentRequest: any, resolve: any, reject: any) {
        return (status: any, stripe3dsResponse:any) => {
            if (status !== 200 || stripe3dsResponse.error) {  // problem
                reject(stripe3dsResponse.error);
            } else {
                if (!this._stripeSdk) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                window.location.href = stripe3dsResponse.redirect.url;

                const onPollCallbackReal = this.onPollCallback(paymentRequest, resolve, reject);
                this._stripeSdk.source.poll(stripe3dsResponse.id, stripe3dsResponse.client_secret, onPollCallbackReal);
            }
        };
    }

    onPollCallback(paymentRequest: any, resolve: any, reject: any) {
        return (status: any, source: any) => {
            if (status !== 200 || source.error) {
                reject(source.error);
            } else if (source.status === 'canceled' || source.status === 'consumed' || source.status === 'failed') {
                reject(source.status);
            } else if (/* source.three_d_secure.authenticated && */ source.status === 'chargeable') {
                /* some cards do not need to be authenticated, like the 4242 4242 4242 4242 */
                resolve(source);
            }
        };
    }

}
