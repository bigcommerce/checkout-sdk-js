export interface BaseInstrument {
    bigpayToken: string;
    defaultInstrument: boolean;
    provider: string;
    trustedShippingAddress: boolean;
    method: string;
    type: string;
}

export function isBaseInstrument(instrument: unknown): instrument is BaseInstrument {
    if (typeof instrument !== 'object' || instrument === null) {
        return false;
    }

    return (
        'bigpayToken' in instrument &&
        'defaultInstrument' in instrument &&
        'provider' in instrument &&
        'trustedShippingAddress' in instrument &&
        'method' in instrument &&
        'type' in instrument
    );
}
