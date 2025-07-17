import { isEmpty } from 'lodash';

import {
    Address,
    CancellablePromise,
    CreditCardInstrument,
    NonceInstrument,
    NotInitializedError,
    NotInitializedErrorType,
    OrderPaymentRequestBody,
    PaymentArgumentInvalidError,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
    PaymentMethodCancelledError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    BraintreeError,
    BraintreeFormOptions,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeRequestData,
    BraintreeThreeDSecure,
    BraintreeVenmoCheckout,
    BraintreeVenmoCreatorConfig,
    BraintreeVerifyPayload,
    TokenizationPayload,
} from './index';
import {
    BraintreePaymentInitializeOptions,
    BraintreeThreeDSecureOptions,
} from '@bigcommerce/checkout-sdk/braintree-integration';
import isCreditCardInstrumentLike from './is-credit-card-instrument-like';
import { BraintreeHostedForm } from '@bigcommerce/checkout-sdk/braintree-integration';

export default class BraintreePaymentProcessor {
    private threeDSecureOptions?: BraintreeThreeDSecureOptions;

    constructor(
        private braintreeIntegrationService: BraintreeIntegrationService,
        private braintreeHostedForm: BraintreeHostedForm,
    ) {}

    initialize(clientToken: string, options?: BraintreePaymentInitializeOptions): void {
        this.braintreeIntegrationService.initialize(clientToken);
        this.threeDSecureOptions = options?.threeDSecure;
    }

    deinitialize(): Promise<void> {
        return this.braintreeIntegrationService.teardown();
    }

    preloadPaypalCheckout(
        paypalCheckoutConfig: Partial<BraintreePaypalSdkCreatorConfig>,
        onSuccess: (instance: BraintreePaypalCheckout) => void,
        onError: (error: BraintreeError) => void,
    ) {
        return this.braintreeIntegrationService.getPaypalCheckout(
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

        const errors = this.getErrorsRequiredFields(paymentData);

        if (!isEmpty(errors)) {
            throw new PaymentInvalidFormError(errors);
        }

        const requestData = this.mapToCreditCard(paymentData, billingAddress);
        const client = await this.braintreeIntegrationService.getClient();
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
        return this.braintreeIntegrationService.getDataCollector().then(({ deviceData }) => deviceData);
    }

    /**
     * @deprecated Use getSessionId() and combine them in the consumer.
     */
    appendSessionId(processedPayment: Promise<NonceInstrument>): Promise<NonceInstrument> {
        return processedPayment
            .then((paymentData) =>
                Promise.all([paymentData, this.braintreeIntegrationService.getDataCollector()]),
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
        return this.braintreeHostedForm.initialize(options, unsupportedCardBrands);
    }

    validateHostedForm() {
        return this.braintreeHostedForm.validate();
    }

    isInitializedHostedForm(): boolean {
        return this.braintreeHostedForm.isInitialized();
    }

    async deinitializeHostedForm(): Promise<void> {
        await this.braintreeHostedForm.deinitialize();
    }

    tokenizeHostedForm(billingAddress: Address): Promise<NonceInstrument> {
        return this.braintreeHostedForm.tokenize(billingAddress);
    }

    tokenizeHostedFormForStoredCardVerification(): Promise<NonceInstrument> {
        return this.braintreeHostedForm.tokenizeForStoredCardVerification();
    }

    async verifyCardWithHostedForm(
        billingAddress: Address,
        amount: number,
    ): Promise<NonceInstrument> {
        const tokenizationPayload = await this.braintreeHostedForm.tokenize(billingAddress);

        return this.challenge3DSVerification(tokenizationPayload, amount);
    }

    async challenge3DSVerification(
        tokenizationPayload: TokenizationPayload,
        amount: number,
    ): Promise<NonceInstrument> {
        const threeDSecure = await this.braintreeIntegrationService.get3DS();

        return this.present3DSChallenge(threeDSecure, amount, tokenizationPayload);
    }

    async getVenmoCheckout(
        venmoConfig?: BraintreeVenmoCreatorConfig,
    ): Promise<BraintreeVenmoCheckout> {
        return new Promise((resolve, reject) => {
            this.braintreeIntegrationService.getVenmoCheckout(resolve, reject, venmoConfig);
        });
    }

    private getErrorsRequiredFields(
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

    private present3DSChallenge(
        threeDSecure: BraintreeThreeDSecure,
        amount: number,
        tokenizationPayload: TokenizationPayload,
    ): Promise<BraintreeVerifyPayload> {
        const { nonce, bin } = tokenizationPayload;

        if (!this.threeDSecureOptions || !nonce) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const {
            addFrame,
            removeFrame,
            challengeRequested = true,
            additionalInformation,
        } = this.threeDSecureOptions;
        const cancelVerifyCard = async () => {
            const response = await threeDSecure.cancelVerifyCard();

            verification.cancel(new PaymentMethodCancelledError());

            return response;
        };

        const roundedAmount = amount.toFixed(2);

        const verification = new CancellablePromise(
            threeDSecure.verifyCard({
                addFrame: (error, iframe) => {
                    addFrame && addFrame(error, iframe, cancelVerifyCard);
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

    private mapToCreditCard(
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
