import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../../common/error';
import { arrayReplace, objectMerge, objectSet } from '../../common/utility';

import Instrument from './instrument';
import { InstrumentAction, InstrumentActionType } from './instrument-actions';
import InstrumentState, { DEFAULT_STATE, InstrumentErrorState, InstrumentMeta, InstrumentStatusState } from './instrument-state';

export default function instrumentReducer(
    state: InstrumentState = DEFAULT_STATE,
    action: Action
): InstrumentState {
    const reducer = combineReducers<InstrumentState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Instrument[] = DEFAULT_STATE.data,
    action: InstrumentAction
): Instrument[] {
    switch (action.type) {
    case InstrumentActionType.LoadInstrumentsSucceeded:
        return arrayReplace(data, action.payload && action.payload.vaultedInstruments || []);

    case InstrumentActionType.DeleteInstrumentSucceeded:
        return arrayReplace(data, data.filter(instrument =>
            instrument.bigpayToken !== (action.meta && action.meta.instrumentId)
        ));

    default:
        return data;
    }
}

function metaReducer(
    meta: InstrumentMeta | undefined,
    action: InstrumentAction
): InstrumentMeta | undefined {
    switch (action.type) {
    case InstrumentActionType.LoadInstrumentsSucceeded:
    case InstrumentActionType.DeleteInstrumentSucceeded:
        return objectMerge(meta, action.meta);

    default:
        return meta;
    }
}

function errorsReducer(
    errors: InstrumentErrorState = DEFAULT_STATE.errors,
    action: InstrumentAction
): InstrumentErrorState {
    switch (action.type) {
    case InstrumentActionType.LoadInstrumentsRequested:
    case InstrumentActionType.LoadInstrumentsSucceeded:
        return objectSet(errors, 'loadError', undefined);

    case InstrumentActionType.DeleteInstrumentRequested:
    case InstrumentActionType.DeleteInstrumentSucceeded:
        return objectMerge(errors, {
            deleteError: undefined,
            failedInstrument: undefined,
        });

    case InstrumentActionType.LoadInstrumentsFailed:
        return objectSet(errors, 'loadError', action.payload);

    case InstrumentActionType.DeleteInstrumentFailed:
        return objectMerge(errors, {
            deleteError: action.payload,
            failedInstrument: action.meta.instrumentId,
        });

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: InstrumentStatusState = DEFAULT_STATE.statuses,
    action: InstrumentAction
): InstrumentStatusState {
    switch (action.type) {
    case InstrumentActionType.LoadInstrumentsRequested:
        return objectSet(statuses, 'isLoading', true);

    case InstrumentActionType.DeleteInstrumentRequested:
        return objectMerge(statuses, {
            isDeleting: true,
            deletingInstrument: action.meta.instrumentId,
        });

    case InstrumentActionType.LoadInstrumentsSucceeded:
    case InstrumentActionType.LoadInstrumentsFailed:
        return objectSet(statuses, 'isLoading', false);

    case InstrumentActionType.DeleteInstrumentSucceeded:
    case InstrumentActionType.DeleteInstrumentFailed:
        return objectMerge(statuses, {
            isDeleting: false,
            deletingInstrument: undefined,
        });

    default:
        return statuses;
    }
}
