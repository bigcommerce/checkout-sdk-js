import { Payment } from '../..';
import { InternalAddress } from '../../../address';
import { NotInitializedError } from '../../../common/error/errors';
import { CancellablePromise } from '../../../common/utility';
import { PaymentMethodCancelledError } from '../../errors';
import { CreditCard, TokenizedCreditCard } from '../../payment';

import * as Braintree from './braintree';
import { BraintreePaymentInitializeOptions, BraintreeThreeDSecureOptions } from './braintree-payment-options';
import BraintreeSDKCreator from './braintree-sdk-creator';

export default class BraintreePaymentProcessor {
    private _threeDSecureOptions?: BraintreeThreeDSecureOptions;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator
    ) {}

    initialize(clientToken: string, options?: BraintreePaymentInitializeOptions): void {
        this._braintreeSDKCreator.initialize(clientToken);
        this._threeDSecureOptions = options && options.threeDSecure;
    }

    preloadPaypal(): Promise<Braintree.Paypal> {
        return this._braintreeSDKCreator.getPaypal();
    }

    tokenizeCard(payment: Payment, billingAddress: InternalAddress): Promise<TokenizedCreditCard> {
        const { paymentData } = payment;
        const requestData = this._mapToCreditCard(paymentData as CreditCard, billingAddress);

        return this._braintreeSDKCreator.getClient()
            .then(client => client.request(requestData))
            .then(({ creditCards }) => ({
                nonce: creditCards[0].nonce,
            }));
    }

    paypal(amount: number, storeLanguage: string, currency: string, offerCredit: boolean): Promise<TokenizedCreditCard> {
        return this._braintreeSDKCreator.getPaypal()
            .then(paypal => paypal.tokenize({
                amount,
                currency,
                enableShippingAddress: true,
                flow: 'checkout',
                locale: storeLanguage,
                offerCredit,
                useraction: 'commit',
            }));
    }

    verifyCard(payment: Payment, billingAddress: InternalAddress, amount: number): Promise<TokenizedCreditCard> {
        if (!this._threeDSecureOptions) {
            throw new NotInitializedError('Unable to verify card because the choosen payment method has not been initialized.');
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

    appendSessionId(processedPayment: Promise<TokenizedCreditCard>): Promise<TokenizedCreditCard> {
        return processedPayment
            .then(paymentData => Promise.all([paymentData, this._braintreeSDKCreator.getDataCollector()]))
            .then(([paymentData, { deviceData }]) => ({ ...paymentData, deviceSessionId: deviceData }));
    }

    deinitialize(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    private _mapToCreditCard(creditCard: CreditCard, billingAddress: InternalAddress): Braintree.RequestData {
        let streetAddress = billingAddress.addressLine1;

        if (billingAddress.addressLine2) {
            streetAddress = ` ${billingAddress.addressLine2}`;
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
                        postalCode: billingAddress.postCode,
                        streetAddress,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    }
}
