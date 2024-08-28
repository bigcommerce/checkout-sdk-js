import {
    WithEcpInstrument,
    WithIdealInstrument,
    WithPayByBankInstrument,
    WithSepaInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export function isEcpInstrument(data: unknown): data is WithEcpInstrument {
    return Boolean(
        typeof data === 'object' &&
            data !== null &&
            'accountNumber' in data &&
            'accountType' in data &&
            'shopperPermission' in data &&
            'routingNumber' in data,
    );
}

export function isIdealInstrument(paymentData: unknown): paymentData is WithIdealInstrument {
    return Boolean(typeof paymentData === 'object' && paymentData !== null && 'bic' in paymentData);
}

export function isSepaInstrument(paymentData: unknown): paymentData is WithSepaInstrument {
    return Boolean(
        typeof paymentData === 'object' &&
            paymentData !== null &&
            'iban' in paymentData &&
            'firstName' in paymentData &&
            'lastName' in paymentData &&
            'shopperPermission' in paymentData,
    );
}

export function isPayByBankInstrument(
    paymentData: unknown,
): paymentData is WithPayByBankInstrument {
    return Boolean(
        typeof paymentData === 'object' &&
            paymentData !== null &&
            'iban' in paymentData &&
            !('firstName' in paymentData) &&
            !('lastName' in paymentData) &&
            !('shopperPermission' in paymentData),
    );
}
