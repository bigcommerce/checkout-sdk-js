import { supportsPopups } from '@braintree/browser-detection';
import { isEmpty } from 'lodash';

import { Address } from '../../../address';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { Overlay } from '../../../common/overlay';
import { CancellablePromise } from '../../../common/utility';
import { OrderPaymentRequestBody } from '../../../order';
import { PaymentArgumentInvalidError, PaymentInvalidFormError, PaymentInvalidFormErrorDetails, PaymentMethodCancelledError } from '../../errors';
import { CreditCardInstrument, NonceInstrument } from '../../payment';

import { BraintreePaypal, BraintreeRequestData, BraintreeShippingAddressOverride, BraintreeThreeDSecure, BraintreeTokenizePayload, BraintreeVerifyPayload } from './braintree';
import BraintreeHostedForm from './braintree-hosted-form';
import { BraintreeFormOptions, BraintreePaymentInitializeOptions, BraintreeThreeDSecureOptions } from './braintree-payment-options';
import BraintreeSDKCreator from './braintree-sdk-creator';
import isCreditCardInstrumentLike from './is-credit-card-instrument-like';

export interface PaypalConfig {
    amount: number;
    currency: string;
    locale: string;
    offerCredit?: boolean;
    shippingAddressOverride?: BraintreeShippingAddressOverride;
    shouldSaveInstrument?: boolean;
}

export default class BraintreePaymentProcessor {
    private _threeDSecureOptions?: BraintreeThreeDSecureOptions;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _braintreeHostedForm: BraintreeHostedForm,
        private _overlay: Overlay
    ) {}

    initialize(clientToken: string, options?: BraintreePaymentInitializeOptions): void {
        this._braintreeSDKCreator.initialize(clientToken);
        this._threeDSecureOptions = options?.threeDSecure;
    }

    deinitialize(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    preloadPaypal(): Promise<BraintreePaypal> {
        return this._braintreeSDKCreator.getPaypal();
    }

    async tokenizeCard(payment: OrderPaymentRequestBody, billingAddress: Address): Promise<NonceInstrument> {
        const { paymentData } = payment;

        if (!isCreditCardInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const errors = this._getErrorsRequiredFields(paymentData);

        if (!isEmpty(errors)) {
            throw new PaymentInvalidFormError(errors);
        }

        const requestData = this._mapToCreditCard(paymentData, billingAddress);
        const client = await this._braintreeSDKCreator.getClient();
        const { creditCards } = await client.request(requestData);

        return { nonce: creditCards[0].nonce };
    }

    async verifyCard(payment: OrderPaymentRequestBody, billingAddress: Address, amount: number): Promise<NonceInstrument> {
        const { nonce } = await this.tokenizeCard(payment, billingAddress);

        return this.challenge3DSVerification(nonce, amount);
    }

    paypal({ shouldSaveInstrument, ...config }: PaypalConfig): Promise<BraintreeTokenizePayload> {
        const newWindowFlow = supportsPopups();

        return this._braintreeSDKCreator.getPaypal()
            .then(paypal => {
                if (newWindowFlow) {
                    this._overlay.show({
                        onClick: () => paypal.focusWindow(),
                    });
                }

                return paypal.tokenize({
                    enableShippingAddress: true,
                    flow: shouldSaveInstrument ? 'vault' : 'checkout',
                    useraction: 'commit',
                    ...config,
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

    async initializeHostedForm(options: BraintreeFormOptions): Promise<void> {
        return await this._braintreeHostedForm.initialize(options);
    }

    isInitializedHostedForm(): boolean {
        return this._braintreeHostedForm.isInitialized();
    }

    async deinitializeHostedForm(): Promise<void> {
        await this._braintreeHostedForm.deinitialize();
    }

    tokenizeHostedForm(billingAddress: Address): Promise<NonceInstrument> {
        return this._braintreeHostedForm.tokenize(billingAddress);
    }

    tokenizeHostedFormForStoredCardVerification(): Promise<NonceInstrument> {
        return this._braintreeHostedForm.tokenizeForStoredCardVerification();
    }

    async verifyCardWithHostedForm(billingAddress: Address, amount: number): Promise<NonceInstrument> {
        const { nonce } = await this._braintreeHostedForm.tokenize(billingAddress);

        return this.challenge3DSVerification(nonce, amount);
    }

    async verifyCardWithHostedFormAnd3DSCheck(billingAddress: Address, amount: number, merchantAccountId: string): Promise<NonceInstrument> {
        const { authenticationInsight, nonce } = await this._braintreeHostedForm.tokenizeWith3DSRegulationCheck(billingAddress, merchantAccountId);
        const { regulationEnvironment } = authenticationInsight || {};

        if (regulationEnvironment === 'psd2' || regulationEnvironment === 'unavailable') {
            return this.challenge3DSVerification(nonce, amount);
        }

        return { nonce };
    }

    async challenge3DSVerification(nonce: string, amount: number): Promise<NonceInstrument> {
        const threeDSecure = await this._braintreeSDKCreator.get3DS();

        return this._present3DSChallenge(threeDSecure, amount, nonce);
    }

    private _getErrorsRequiredFields(paymentData: CreditCardInstrument): PaymentInvalidFormErrorDetails {
        const {
            ccNumber,
            ccExpiry,
        } = paymentData;
        const errors: PaymentInvalidFormErrorDetails = {};

        if (!ccNumber) {
            errors.ccNumber = [{
                message: 'Credit card number is required',
                type: 'required',
            }];
        }

        if (!ccExpiry) {
            errors.ccExpiry = [{
                message: 'Expiration date is required',
                type: 'required',
            }];
        }

        return errors;
    }

    private _present3DSChallenge(
        threeDSecure: BraintreeThreeDSecure,
        amount: number,
        nonce: string
    ): Promise<BraintreeVerifyPayload> {
        if (!this._threeDSecureOptions || !nonce) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { addFrame, removeFrame } = this._threeDSecureOptions;
        const cancelVerifyCard = async () => {
            const response = await threeDSecure.cancelVerifyCard();

            verification.cancel(new PaymentMethodCancelledError());

            return response;
        };

        const roundedAmount = amount.toFixed(2);

        const verification = new CancellablePromise(
            threeDSecure.verifyCard({
                addFrame: (error, iframe) => {
                    addFrame(error, iframe, cancelVerifyCard);
                },
                amount: Number(roundedAmount),
                challengeRequested: true,
                nonce,
                removeFrame,
                onLookupComplete: (_data, next) => {
                    next();
                },
            })
        );

        return verification.promise;
    }

    private _mapToCreditCard(creditCard: CreditCardInstrument, billingAddress?: Address): BraintreeRequestData {
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
                    billingAddress: billingAddress && {
                        countryCodeAlpha2: billingAddress.countryCode,
                        locality: billingAddress.city,
                        countryName: billingAddress.country,
                        postalCode: billingAddress.postalCode,
                        streetAddress: billingAddress.address2 ?
                            `${billingAddress.address1} ${billingAddress.address2}` :
                            billingAddress.address1,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    }
}
