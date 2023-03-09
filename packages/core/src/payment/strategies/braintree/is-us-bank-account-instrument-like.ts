import { UsBankAccountInstrument } from '../../payment';

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
