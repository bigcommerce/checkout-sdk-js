import { Payment } from '../..';
import { InternalAddress } from '../../../address';
import { CancellablePromise } from '../../../common/utility';
import { PaymentMethodCancelledError, PaymentMethodUninitializedError } from '../../errors';
import { CreditCard, TokenizedCreditCard } from '../../payment';
import PaymentMethod from '../../payment-method';
import { InitializeOptions } from '../payment-strategy';

import { Braintree } from './braintree';
import BraintreeSDKCreator from './braintree-sdk-creator';

export default class BraintreePaymentProcessor {
    private _modalHandler?: ModalHandler;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator
    ) {}

    initialize(clientToken: string, options: BraintreeCreditCardInitializeOptions): void {
        this._braintreeSDKCreator.initialize(clientToken);
        this._modalHandler = options.modalHandler;
    }

    preloadPaypal(): Promise<Braintree.Paypal> {
        return this._braintreeSDKCreator.getPaypal();
    }

    tokenizeCard(payment: Payment, billingAddress: InternalAddress): Promise<TokenizedCreditCard> {
        const { paymentData } = payment;
        const requestData = this._mapToCreditCard(paymentData as CreditCard, billingAddress);

        return this._braintreeSDKCreator.getClient()
            .then((client) => client.request(requestData))
            .then(({ creditCards }) => ({
                nonce: creditCards[0].nonce,
            }));
    }

    paypal(amount: number, storeLanguage: string, currency: string, offerCredit: boolean): Promise<TokenizedCreditCard> {
        return this._braintreeSDKCreator.getPaypal()
            .then((paypal) => paypal.tokenize({
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
        if (!this._modalHandler) {
            throw new PaymentMethodUninitializedError('A modal handler is required for 3ds payments');
        }

        const { onRemoveFrame, ...modalHandler} = this._modalHandler;

        return Promise.all([
            this.tokenizeCard(payment, billingAddress),
            this._braintreeSDKCreator.get3DS(),
        ]).then(([paymentData, threeDSecure]) => {
            const { nonce } = paymentData as TokenizedCreditCard;

            const verification = threeDSecure.verifyCard({
                ...modalHandler,
                amount,
                nonce,
            });

            const { promise, cancel } = new CancellablePromise(verification);

            onRemoveFrame(() => {
                threeDSecure.cancelVerifyCard()
                    .then(() => cancel(new PaymentMethodCancelledError()));
            });

            return promise;
        });
    }

    appendSessionId(processedPayment: Promise<TokenizedCreditCard>): Promise<TokenizedCreditCard> {
        return processedPayment
            .then((paymentData) => Promise.all([paymentData, this._braintreeSDKCreator.getDataCollector()]))
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

export interface BraintreeCreditCardInitializeOptions extends InitializeOptions {
    paymentMethod: PaymentMethod;
    modalHandler?: ModalHandler;
}

export interface ModalHandler {
    addFrame: () => {};
    removeFrame: () => {};
    onRemoveFrame: (callback: () => void) => void;
}
