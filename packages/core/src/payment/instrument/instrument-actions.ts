import { Action } from '@bigcommerce/data-store';

import { VaultAccessToken } from './instrument';
import { InstrumentsResponseBody } from './instrument-response-body';

export enum InstrumentActionType {
    LoadInstrumentsRequested = 'LOAD_INSTRUMENTS_REQUESTED',
    LoadInstrumentsSucceeded = 'LOAD_INSTRUMENTS_SUCCEEDED',
    LoadInstrumentsFailed = 'LOAD_INSTRUMENTS_FAILED',

    DeleteInstrumentRequested = 'DELETE_INSTRUMENT_REQUESTED',
    DeleteInstrumentSucceeded = 'DELETE_INSTRUMENT_SUCCEEDED',
    DeleteInstrumentFailed = 'DELETE_INSTRUMENT_FAILED',
}

export type InstrumentAction =
    LoadInstrumentsAction |
    DeleteInstrumentAction;

export type LoadInstrumentsAction =
    LoadInstrumentsRequestedAction |
    LoadInstrumentsSucceededAction |
    LoadInstrumentsFailedAction;

export type DeleteInstrumentAction =
    DeleteInstrumentRequestedAction |
    DeleteInstrumentSucceededAction |
    DeleteInstrumentFailedAction;

export interface LoadInstrumentsRequestedAction extends Action {
    type: InstrumentActionType.LoadInstrumentsRequested;
}

export interface LoadInstrumentsSucceededAction extends Action<InstrumentsResponseBody, VaultAccessToken> {
    type: InstrumentActionType.LoadInstrumentsSucceeded;
}

export interface LoadInstrumentsFailedAction extends Action<Error> {
    type: InstrumentActionType.LoadInstrumentsFailed;
}

export interface DeleteInstrumentRequestedAction extends Action {
    type: InstrumentActionType.DeleteInstrumentRequested;
}

export interface DeleteInstrumentSucceededAction extends Action<InstrumentsResponseBody, VaultAccessToken & { instrumentId: string }> {
    type: InstrumentActionType.DeleteInstrumentSucceeded;
}

export interface DeleteInstrumentFailedAction extends Action<Error> {
    type: InstrumentActionType.DeleteInstrumentFailed;
}
