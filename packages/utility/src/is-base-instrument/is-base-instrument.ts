import { BaseInstrument } from '../../../payment-integration-api/src/payment/instrument';

export function isBaseInstrument(instrument: unknown): instrument is BaseInstrument {
    if (typeof instrument !== 'object' || instrument === null) {
        return false;
    }

    const baseInstrument = instrument as Record<string, unknown>;

    return (
        'bigpayToken' in baseInstrument &&
        'defaultInstrument' in baseInstrument &&
        'provider' in baseInstrument &&
        'trustedShippingAddress' in baseInstrument &&
        'method' in baseInstrument &&
        'type' in baseInstrument
    );
}
