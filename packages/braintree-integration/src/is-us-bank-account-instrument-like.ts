import {
    PaymentInstrumentPayload,
    WithBankAccountInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isUsBankAccountInstrumentLike(
    instrument?: PaymentInstrumentPayload,
): instrument is WithBankAccountInstrument {
    if (!instrument) {
        return false;
    }

    return (
        'accountNumber' in instrument &&
        'routingNumber' in instrument &&
        'ownershipType' in instrument &&
        'accountType' in instrument
    );
}
