import { CreditCardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isCreditCardInstrumentLike(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instrument: any,
): instrument is CreditCardInstrument {
    return (
        typeof instrument === 'object' &&
        instrument !== null &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof instrument.ccExpiry === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof instrument.ccNumber === 'string' &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof instrument.ccName === 'string'
    );
}
