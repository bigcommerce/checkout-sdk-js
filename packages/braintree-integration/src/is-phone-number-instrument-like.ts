import {
    PaymentInstrumentPayload,
    WithPhoneNumberInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isPhoneNumberInstrumentLike(
    paymentData?: PaymentInstrumentPayload,
): paymentData is WithPhoneNumberInstrument {
    if (!paymentData) {
        return false;
    }

    return 'phoneNumber' in paymentData;
}
