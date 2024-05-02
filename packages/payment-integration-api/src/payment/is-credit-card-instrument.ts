import isVaultedInstrument from './is-vaulted-instrument';
import { CreditCardInstrument } from './payment';

export default function isCreditCardInstrument(
    instrument: unknown,
): instrument is CreditCardInstrument {
    const card = instrument as CreditCardInstrument;

    return (
        !isVaultedInstrument(card) &&
        typeof card.ccName === 'string' &&
        typeof card.ccNumber === 'string' &&
        typeof card.ccExpiry === 'object' &&
        typeof card.ccExpiry.month === 'string' &&
        typeof card.ccExpiry.year === 'string'
    );
}
