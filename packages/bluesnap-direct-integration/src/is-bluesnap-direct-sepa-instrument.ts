import {
    PaymentArgumentInvalidError,
    SepaInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

function isSepaInstrument(paymentData: unknown): paymentData is SepaInstrument {
    return Boolean(
        typeof paymentData === 'object' &&
            paymentData !== null &&
            'iban' in paymentData &&
            'firstName' in paymentData &&
            'lastName' in paymentData &&
            'shopperPermission' in paymentData,
    );
}

export default function assertSepaInstrument(
    paymentData: unknown,
): asserts paymentData is SepaInstrument {
    if (!isSepaInstrument(paymentData)) {
        throw new PaymentArgumentInvalidError();
    }
}
