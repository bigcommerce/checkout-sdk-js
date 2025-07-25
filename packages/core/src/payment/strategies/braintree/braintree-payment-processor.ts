import { isEmpty } from 'lodash';

import { CancellablePromise } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Address } from '../../../address';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderPaymentRequestBody } from '../../../order';
import {
    PaymentArgumentInvalidError,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
    PaymentMethodCancelledError,
} from '../../errors';
import { CreditCardInstrument, NonceInstrument } from '../../payment';

import {
    BraintreeError,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeRequestData,
    BraintreeThreeDSecure,
    BraintreeVenmoCheckout,
    BraintreeVenmoCreatorConfig,
    BraintreeVerifyPayload,
    TokenizationPayload,
} from './braintree';
import BraintreeHostedForm from './braintree-hosted-form';
import {
    BraintreeFormOptions,
    BraintreePaymentInitializeOptions,
    BraintreeThreeDSecureOptions,
} from './braintree-payment-options';
import BraintreeSDKCreator from './braintree-sdk-creator';
import isCreditCardInstrumentLike from './is-credit-card-instrument-like';

export default class BraintreePaymentProcessor {
    private _threeDSecureOptions?: BraintreeThreeDSecureOptions;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _braintreeHostedForm: BraintreeHostedForm,
    ) {}

    initialize(clientToken: string, options?: BraintreePaymentInitializeOptions): void {
        this._braintreeSDKCreator.initialize(clientToken);
        this._threeDSecureOptions = options?.threeDSecure;
    }

    deinitialize(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    preloadPaypalCheckout(
        paypalCheckoutConfig: Partial<BraintreePaypalSdkCreatorConfig>,
        onSuccess: (instance: BraintreePaypalCheckout) => void,
        onError: (error: BraintreeError) => void,
    ) {
        return this._braintreeSDKCreator.getPaypalCheckout(
            paypalCheckoutConfig,
            onSuccess,
            onError,
        );
    }

    async tokenizeCard(
        payment: OrderPaymentRequestBody,
        billingAddress: Address,
    ): Promise<TokenizationPayload> {
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

        return {
            nonce: creditCards[0].nonce,
            bin: creditCards[0].details?.bin,
        };
    }

    async verifyCard(
        payment: OrderPaymentRequestBody,
        billingAddress: Address,
        amount: number,
    ): Promise<NonceInstrument> {
        const tokenizationPayload = await this.tokenizeCard(payment, billingAddress);

        return this.challenge3DSVerification(tokenizationPayload, amount);
    }

    getSessionId(): Promise<string | undefined> {
        return this._braintreeSDKCreator.getDataCollector().then(({ deviceData }) => deviceData);
    }

    /**
     * @deprecated Use getSessionId() and combine them in the consumer.
     */
    appendSessionId(processedPayment: Promise<NonceInstrument>): Promise<NonceInstrument> {
        return processedPayment
            .then((paymentData) =>
                Promise.all([paymentData, this._braintreeSDKCreator.getDataCollector()]),
            )
            .then(([paymentData, { deviceData }]) => ({
                ...paymentData,
                deviceSessionId: deviceData,
            }));
    }

    async initializeHostedForm(
        options: BraintreeFormOptions,
        unsupportedCardBrands?: string[],
    ): Promise<void> {
        return this._braintreeHostedForm.initialize(options, unsupportedCardBrands);
    }

    validateHostedForm() {
        return this._braintreeHostedForm.validate();
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

    async verifyCardWithHostedForm(
        billingAddress: Address,
        amount: number,
    ): Promise<NonceInstrument> {
        const tokenizationPayload = await this._braintreeHostedForm.tokenize(billingAddress);

        return this.challenge3DSVerification(tokenizationPayload, amount);
    }

    async challenge3DSVerification(
        tokenizationPayload: TokenizationPayload,
        amount: number,
    ): Promise<NonceInstrument> {
        const threeDSecure = await this._braintreeSDKCreator.get3DS();

        return this._present3DSChallenge(threeDSecure, amount, tokenizationPayload);
    }

    async getVenmoCheckout(
        venmoConfig?: BraintreeVenmoCreatorConfig,
    ): Promise<BraintreeVenmoCheckout> {
        return new Promise((resolve, reject) => {
            this._braintreeSDKCreator.getVenmoCheckout(resolve, reject, venmoConfig);
        });
    }

    private _getErrorsRequiredFields(
        paymentData: CreditCardInstrument,
    ): PaymentInvalidFormErrorDetails {
        const { ccNumber, ccExpiry } = paymentData;
        const errors: PaymentInvalidFormErrorDetails = {};

        if (!ccNumber) {
            errors.ccNumber = [
                {
                    message: 'Credit card number is required',
                    type: 'required',
                },
            ];
        }

        if (!ccExpiry) {
            errors.ccExpiry = [
                {
                    message: 'Expiration date is required',
                    type: 'required',
                },
            ];
        }

        return errors;
    }

    private _present3DSChallenge(
        threeDSecure: BraintreeThreeDSecure,
        amount: number,
        tokenizationPayload: TokenizationPayload,
    ): Promise<BraintreeVerifyPayload> {
        const { nonce, bin } = tokenizationPayload;

        if (!this._threeDSecureOptions || !nonce) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const {
            addFrame,
            removeFrame,
            challengeRequested = true,
            additionalInformation,
        } = this._threeDSecureOptions;
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
                bin,
                challengeRequested,
                nonce,
                removeFrame,
                onLookupComplete: (_data, next) => {
                    next();
                },
                collectDeviceData: true,
                additionalInformation,
            }),
        );

        return verification.promise;
    }

    private _mapToCreditCard(
        creditCard: CreditCardInstrument,
        billingAddress?: Address,
    ): BraintreeRequestData {
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
                        streetAddress: billingAddress.address2
                            ? `${billingAddress.address1} ${billingAddress.address2}`
                            : billingAddress.address1,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    }
}
