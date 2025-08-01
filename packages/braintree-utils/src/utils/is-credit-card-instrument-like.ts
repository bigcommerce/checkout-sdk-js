import { CreditCardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isCreditCardInstrumentLike(
    instrument: unknown,
): instrument is CreditCardInstrument {
    if (typeof instrument !== 'object' || instrument === null) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const creditCardInstrument = instrument as Partial<Record<string, unknown>>;

    return (
        typeof creditCardInstrument.ccExpiry === 'object' &&
        creditCardInstrument.ccExpiry !== null &&
        typeof creditCardInstrument.ccNumber === 'string' &&
        typeof creditCardInstrument.ccName === 'string'
    );
}
