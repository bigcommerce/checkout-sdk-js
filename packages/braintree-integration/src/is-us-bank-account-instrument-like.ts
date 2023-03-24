import { UsBankAccountInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isUsBankAccountInstrumentLike(
    instrument: any,
): instrument is UsBankAccountInstrument {
    return (
        instrument &&
        typeof instrument.accountNumber === 'string' &&
        typeof instrument.routingNumber === 'string' &&
        typeof instrument.ownershipType === 'string'
    );
}
