import {
    CardInstrument,
    CreditCardInstrument,
    Payment,
    PaymentInstrument,
    PaymentMethod,
    PaymentResponseBody,
    UntrustedShippingCardVerificationType,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getPayment(): Payment {
    return {
        methodId: 'authorizenet',
        paymentData: getCreditCardInstrument(),
    };
}

export function getPaymentMethod(): PaymentMethod {
    return {
        id: 'authorizenet',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Authorizenet',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        skipRedirectConfirmationAlert: false,
    };
}

export function getPaymentMethodsMeta() {
    return {
        geoCountryCode: 'AU',
        deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
        sessionHash: 'cfbbbac580a920b395571fe086db1e06',
    };
}

export function getCreditCardInstrument(): CreditCardInstrument {
    return {
        ccExpiry: {
            month: '10',
            year: '2020',
        },
        ccName: 'BigCommerce',
        ccNumber: '4111111111111111',
        ccCvv: '123',
    };
}

export function getCardInstrument(): CardInstrument {
    return {
        bigpayToken: '123',
        defaultInstrument: true,
        provider: 'bigcommerce',
        trustedShippingAddress: true,
        method: 'bigcommerce',
        brand: 'visa',
        expiryMonth: '04',
        expiryYear: '30',
        iin: '1234',
        last4: '1111',
        type: 'card',
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
    };
}

export function getInstruments(): PaymentInstrument[] {
    return [
        {
            bigpayToken: '123',
            provider: 'braintree',
            iin: '11111111',
            last4: '4321',
            expiryMonth: '02',
            expiryYear: '2020',
            brand: 'test',
            trustedShippingAddress: true,
            defaultInstrument: true,
            method: 'credit_card',
            untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
            type: 'card',
        },
        {
            bigpayToken: '111',
            provider: 'authorizenet',
            iin: '11222333',
            last4: '4444',
            expiryMonth: '10',
            expiryYear: '2024',
            brand: 'test',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'credit_card',
            untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
            type: 'card',
        },
        {
            bigpayToken: '31415',
            provider: 'braintree',
            trustedShippingAddress: false,
            defaultInstrument: false,
            type: 'account',
            method: 'paypal',
            externalId: 'test@external-id.com',
        },
        {
            bigpayToken: '45312',
            provider: 'paypalcommerce',
            trustedShippingAddress: true,
            defaultInstrument: true,
            type: 'account',
            method: 'paypal',
            externalId: 'test@external-id.com',
        },
        {
            bigpayToken: '52346',
            provider: 'ideal',
            trustedShippingAddress: false,
            accountNumber: 'DEFDEF',
            issuer: 'TEST2',
            defaultInstrument: false,
            type: 'bank',
            method: 'bank',
            iban: 'DEFDEF',
        },
        {
            bigpayToken: '56789',
            provider: 'adyenv2',
            iin: '11111111',
            last4: '4321',
            expiryMonth: '02',
            expiryYear: '2020',
            brand: 'test',
            trustedShippingAddress: true,
            defaultInstrument: true,
            method: 'scheme',
            type: 'card',
            untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
        },
    ];
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
        errors: [{ code: 'insufficient_funds', message: 'Insufficient funds' }],
    };
}

export function getPaymentResponseBody(): PaymentResponseBody {
    return {
        status: 'ok',
        id: 'b12e69cb-d76e-4d86-8d3d-94e8a07c9051',
        avs_result: {},
        cvv_result: {},
        three_ds_result: {},
        fraud_review: true,
        transaction_type: 'purchase',
        errors: [],
    };
}
