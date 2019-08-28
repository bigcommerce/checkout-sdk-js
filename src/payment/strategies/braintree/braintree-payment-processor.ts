import { Address } from '../../../address';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { Overlay } from '../../../common/overlay';
import { CancellablePromise } from '../../../common/utility';
import { OrderPaymentRequestBody } from '../../../order';
import { PaymentMethodCancelledError } from '../../errors';
import { CreditCardInstrument, NonceInstrument } from '../../payment';

import { BraintreePaypal, BraintreeRequestData, BraintreeTokenizePayload, BraintreeVerifyPayload } from './braintree';
import { BraintreePaymentInitializeOptions, BraintreeThreeDSecureOptions } from './braintree-payment-options';
import BraintreeSDKCreator from './braintree-sdk-creator';

export default class BraintreePaymentProcessor {
    private _threeDSecureOptions?: BraintreeThreeDSecureOptions;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _overlay: Overlay
    ) {}

    initialize(clientToken: string, options?: BraintreePaymentInitializeOptions): void {
        this._braintreeSDKCreator.initialize(clientToken);
        this._threeDSecureOptions = options && options.threeDSecure;
    }

    preloadPaypal(): Promise<BraintreePaypal> {
        return this._braintreeSDKCreator.getPaypal();
    }

    tokenizeCard(payment: OrderPaymentRequestBody, billingAddress: Address): Promise<NonceInstrument> {
        const { paymentData } = payment;
        const requestData = this._mapToCreditCard(paymentData as CreditCardInstrument, billingAddress);

        return this._braintreeSDKCreator.getClient()
            .then(client => client.request(requestData))
            .then(({ creditCards }) => ({
                nonce: creditCards[0].nonce,
            }));
    }

    paypal(amount: number, storeLanguage: string, currency: string, offerCredit: boolean): Promise<BraintreeTokenizePayload> {
        return this._braintreeSDKCreator.getPaypal()
            .then(paypal => {
                this._overlay.show({
                    onClick: () => paypal.focusWindow(),
                });

                return paypal.tokenize({
                    amount,
                    currency,
                    enableShippingAddress: true,
                    flow: 'checkout',
                    locale: storeLanguage,
                    offerCredit,
                    useraction: 'commit',
                });
            })
            .then(response => {
                this._overlay.remove();

                return response;
            })
            .catch(error => {
                this._overlay.remove();

                throw error;
            });
    }

    verifyCard(payment: OrderPaymentRequestBody, billingAddress: Address, amount: number): Promise<BraintreeVerifyPayload> {
        if (!this._threeDSecureOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { addFrame, removeFrame } = this._threeDSecureOptions;

        return Promise.all([
            this.tokenizeCard(payment, billingAddress),
            this._braintreeSDKCreator.get3DS(),
        ]).then(([paymentData, threeDSecure]) => {
            const { nonce } = paymentData;
            const cancelVerifyCard = () => threeDSecure.cancelVerifyCard()
                .then(response => {
                    verification.cancel(new PaymentMethodCancelledError());

                    return response;
                });

            const verification = new CancellablePromise(
                threeDSecure.verifyCard({
                    addFrame: (error, iframe) => {
                        addFrame(error, iframe, cancelVerifyCard);
                    },
                    amount,
                    nonce,
                    removeFrame,
                })
            );

            return verification.promise;
        });
    }

    getSessionId(): Promise<string | undefined> {
        return this._braintreeSDKCreator.getDataCollector()
            .then(({ deviceData }) => deviceData);
    }

    /**
     * @deprecated Use getSessionId() and combine them in the consumer.
     */
    appendSessionId(processedPayment: Promise<NonceInstrument>): Promise<NonceInstrument> {
        return processedPayment
            .then(paymentData => Promise.all([paymentData, this._braintreeSDKCreator.getDataCollector()]))
            .then(([paymentData, { deviceData }]) => ({ ...paymentData, deviceSessionId: deviceData }));
    }

    deinitialize(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    private _mapToCreditCard(creditCard: CreditCardInstrument, billingAddress: Address): BraintreeRequestData {
        let streetAddress = billingAddress.address1;

        if (billingAddress.address2) {
            streetAddress = ` ${billingAddress.address2}`;
        }

        return {
            data: {
                creditCard: {
                    cardholderName: creditCard.ccName,
                    number: creditCard.ccNumber,
                    cvv: creditCard.ccCvv,
                    expirationDate: `${creditCard.ccExpiry.month}/${creditCard.ccExpiry.year}`,
                    options: {
                        validate: false,
                    },
                    billingAddress: {
                        countryName: billingAddress.country,
                        postalCode: billingAddress.postalCode,
                        streetAddress,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    }
}
