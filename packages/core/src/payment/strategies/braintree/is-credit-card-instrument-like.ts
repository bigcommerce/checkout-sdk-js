import { CreditCardInstrument } from '../../payment';

export default function isCreditCardInstrumentLike(instrument: any): instrument is CreditCardInstrument {
    return instrument && typeof instrument.ccExpiry === 'object' &&
        typeof instrument.ccNumber === 'string' &&
        typeof instrument.ccName === 'string';
}
