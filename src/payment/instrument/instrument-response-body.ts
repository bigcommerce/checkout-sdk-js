import Instrument from './instrument';

export type InstrumentError = Array<{
    code: string;
    message: string;
}>;

export interface InstrumentResponseBody {
    vaulted_instrument: Instrument;
    errors?: [InstrumentError];
}

export interface InstrumentsResponseBody {
    vaulted_instruments: Instrument[];
    errors?: [InstrumentError];
}

export interface VaultAccessTokenResponseBody {
    token: string;
    expires_at: number;
    errors?: [InstrumentError];
}
