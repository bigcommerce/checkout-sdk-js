import {
    CreditCardInstrument,
    Payment,
    VaultedInstrument,
    PaymentResponseBody,
} from "@bigcommerce/checkout-sdk/payment-integration-api";

export function getPayment(): Payment {
    return {
        methodId: "authorizenet",
        paymentData: getCreditCardInstrument(),
    };
}

export function getCreditCardInstrument(): CreditCardInstrument {
    return {
        ccExpiry: {
            month: "10",
            year: "2020",
        },
        ccName: "BigCommerce",
        ccNumber: "4111111111111111",
        ccCvv: "123",
    };
}

export function getVaultedInstrument(): VaultedInstrument {
    return {
        instrumentId: '123',
    };
}

export function getErrorPaymentResponseBody(): PaymentResponseBody {
    return {
        status: 'error',
        id: '1093a806-6cc2-4b5a-b551-77fd21446a1b',
        avs_result: {},
        cvv_result: {},
        three_ds_result: {},
        fraud_review: true,
        transaction_type: 'purchase',
        errors: [
            { code: 'insufficient_funds', message: 'Insufficient funds' },
        ],
    };
}
