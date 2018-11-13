import Instrument from './instrument';

export interface InstrumentError {
    code: number;
    message: string;
}

export interface InternalInstrument {
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
    errors?: InstrumentError[];
}

export interface InternalInstrumentsResponseBody {
    vaulted_instruments: InternalInstrument[];
}

export interface InternalInstrumentErrorResponseBody {
    errors?: InstrumentError[];
}

export interface InternalVaultAccessTokenResponseBody {
    data: {
        token: string;
        expires_at: number;
        errors?: InstrumentError[];
    };
}
