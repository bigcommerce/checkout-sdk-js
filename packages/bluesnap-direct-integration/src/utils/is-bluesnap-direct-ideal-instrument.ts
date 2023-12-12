import {
    IdealInstrument,
    PaymentArgumentInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

function isBlueSnapDirectIdealInstrument(paymentData: unknown): paymentData is IdealInstrument {
    return Boolean(typeof paymentData === 'object' && paymentData !== null && 'bic' in paymentData);
}

export default function assertBlueSnapDirectSepaInstrument(
    paymentData: unknown,
): asserts paymentData is IdealInstrument {
    if (!isBlueSnapDirectIdealInstrument(paymentData)) {
        throw new PaymentArgumentInvalidError();
    }
}
