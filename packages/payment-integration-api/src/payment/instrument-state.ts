import PaymentInstrument, { VaultAccessToken } from './instrument';

export default interface InstrumentState {
    data?: PaymentInstrument[];
    meta?: InstrumentMeta;
    errors: InstrumentErrorState;
    statuses: InstrumentStatusState;
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

export const DEFAULT_STATE = {
    data: [],
    errors: {},
    statuses: {},
};
