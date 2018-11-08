import Instrument from './instrument';

export type InstrumentError = Array<{
    code: string;
    message: string;
}>;

export interface RawInstrumentResponseBody {
    bigpay_token: string;
    default_instrument: boolean;
    provider: string;
    iin: string;
    last_4: string;
    expiry_month: string;
    expiry_year: string;
    brand: string;
    trusted_shipping_address: boolean;
}

export interface InstrumentsResponseBody {
    vaultedInstruments: Instrument[];
}

export interface InstrumentErrorResponseBody {
    errors?: [InstrumentError];
}

export interface RawInstrumentsResponseBody {
    vaulted_instruments: RawInstrumentResponseBody[];
}

export interface RawInstrumentErrorResponseBody {
    errors?: [InstrumentError];
}

export interface VaultAccessTokenResponseBody {
    token: string;
    expires_at: number;
    errors?: [InstrumentError];
}
