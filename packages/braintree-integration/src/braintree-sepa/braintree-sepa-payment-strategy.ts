import {
    BraintreeInitializationData,
    BraintreeIntegrationService,
    isBraintreeError,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    // isHostedInstrumentLike,
    // isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeSepa, BraintreeSepaPayload } from "../../../braintree-utils/src/braintree";
import { WithBraintreeSepaInstrument } from "../../../payment-integration-api/src/payment";

export default class BraintreeSepaPaymentStrategy implements PaymentStrategy {
    private braintreeSepa?: BraintreeSepa;
    private merchantId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions,
    ): Promise<void> {
        if (!options.methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(options.methodId);

        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();

        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(
            options.methodId,
        );

        const { clientToken } = paymentMethod;
        this.merchantId = paymentMethod.config.merchantId;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken, storeConfig);
            this.braintreeSepa = await this.braintreeIntegrationService.getBraintreeSepa();
        } catch (error) {
            this.handleError(error);
        }
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        // const isSubmittingWithVaultingInstrument = isVaultedInstrument(payment.paymentData || {});

        // const nonce = isSubmittingWithVaultingInstrument
        //     ? await this.tokenizePaymentForVaultedInstrument(payment)
        //     : await this.tokenizePayment(payment);
        const nonce = await this.tokenizePayment(payment);

        // const submitPaymentPayload = isSubmittingWithVaultingInstrument
        //     ? await this.preparePaymentDataForVaultedInstrument(nonce, payment)
        //     : await this.preparePaymentData(nonce, payment);
        const submitPaymentPayload = await this.preparePaymentData(nonce, payment)
        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(submitPaymentPayload);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private async preparePaymentData(
        nonce: string | null,
        payment: OrderPaymentRequestBody,
    ): Promise<Payment> {
        const { paymentData = {} } = payment;
        console.log('paymentData', paymentData);
        console.log('nonce', nonce);

        const paymentPayload = {

        };

        return {
            methodId: payment.methodId,
            paymentData: paymentPayload,
        };
    }

    // private async preparePaymentDataForVaultedInstrument(
    //     nonce: string | null,
    //     payment: OrderPaymentRequestBody,
    // ): Promise<Payment> {
    //     const { paymentData = {} } = payment;
    //
    //     if (!isVaultedInstrument(paymentData) || !isHostedInstrumentLike(paymentData)) {
    //         throw new PaymentArgumentInvalidError(['payment.paymentData']);
    //     }
    //
    //     const sessionId = await this.braintreeIntegrationService.getSessionId();
    //
    //     return {
    //         methodId: payment.methodId,
    //         paymentData: {
    //             deviceSessionId: sessionId,
    //             instrumentId: paymentData.instrumentId,
    //             shouldSetAsDefaultInstrument: paymentData.shouldSetAsDefaultInstrument,
    //             ...(nonce && { nonce }),
    //         },
    //     };
    // }

    private async tokenizePayment({ paymentData }: OrderPaymentRequestBody): Promise<string> {
        const sepa = this.getBraintreeSepaOrThrow();
        const sepaDetails = this.getSepaDetails(paymentData as WithBraintreeSepaInstrument);

        try {
            const { nonce } = await sepa.tokenize(sepaDetails);

            return nonce;
        } catch (error) {
            this.handleError(error);
        }
    }

    // private async tokenizePaymentForVaultedInstrument(
    //     payment: OrderPaymentRequestBody,
    // ): Promise<string | null> {
    //     const { methodId, paymentData = {} } = payment;
    //
    //     const state = this.paymentIntegrationService.getState();
    //     const { config } = state.getPaymentMethodOrThrow(methodId);
    //
    //     if (!config.isVaultingEnabled) {
    //         throw new InvalidArgumentError(
    //             'Vaulting is disabled but a vaulted instrument was being used for this transaction',
    //         );
    //     }
    //
    //     const shouldVerifyVaultingInstrument = isUsBankAccountInstrumentLike(paymentData);
    //
    //     return shouldVerifyVaultingInstrument ? this.tokenizePayment(payment) : null;
    // }

    private getSepaDetails(paymentData: WithBraintreeSepaInstrument): BraintreeSepaPayload {
        const state = this.paymentIntegrationService.getState();
        const { accountHolderName, braintreeIban } = paymentData || {};
        const { id: customerId } = state.getCustomer() || {};
        const { countryCode } = state.getBillingAddress() || {};

        return {
            accountHolderName,
            customerId,
            iban: braintreeIban,
            mandateType: 'RECURRENT',
            countryCode,
            merchantAccountId: this.merchantId,
        };
    }

    private getBraintreeSepaOrThrow(): BraintreeSepa {
        if (!this.braintreeSepa) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.braintreeSepa;
    }

    private handleError(error: unknown): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        throw new PaymentMethodFailedError(error.message);
    }
}
