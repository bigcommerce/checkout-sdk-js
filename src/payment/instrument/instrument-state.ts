import Instrument, { VaultAccessToken } from './instrument';

export default interface InstrumentState {
    data: Instrument[];
    errors: InstrumentErrorState;
    statuses: InstrumentStatusState;
    meta?: InstrumentMeta;
}

export interface InstrumentErrorState {
    deleteError?: Error;
    failedInstrument?: string;
    loadError?: Error;
    vaultError?: Error;
}

export interface InstrumentStatusState {
    isDeleting?: boolean;
    isLoading?: boolean;
    isVaulting?: boolean;
    deletingInstrument?: string;
}

export type InstrumentMeta = VaultAccessToken;

export const DEFAULT_STATE: InstrumentState = {
    data: [],
    errors: {},
    statuses: {},
};
