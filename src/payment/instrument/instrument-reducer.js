import { combineReducers } from '@bigcommerce/data-store';
import * as actionTypes from './instrument-action-types';

/**
 * @param {InstrumentState} state
 * @param {Action} action
 * @return {InstrumentState}
 */
export default function instrumentReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?Instruments[]} data
 * @param {Action} action
 * @return {?Instruments[]}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        return action.payload.vaulted_instruments || [];

    case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
        return [...(data || []), action.payload.vaulted_instrument];

    case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
        return (data || []).filter(instrument =>
            instrument.bigpay_token !== action.payload.instrumentId
        );

    default:
        return data;
    }
}

/**
 * @private
 * @param {?Object} meta
 * @param {Action} action
 * @return {?Object}
 */
function metaReducer(meta, action) {
    switch (action.type) {
    case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
    case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
    case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
        return { ...meta, ...action.meta };

    default:
        return meta;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors = {}, action) {
    switch (action.type) {
    case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
    case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case actionTypes.VAULT_INSTRUMENT_REQUESTED:
    case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
        return { ...errors, vaultError: undefined };

    case actionTypes.DELETE_INSTRUMENT_REQUESTED:
    case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
        return {
            ...errors,
            deleteError: undefined,
            failedInstrument: undefined,
        };

    case actionTypes.LOAD_INSTRUMENTS_FAILED:
        return { ...errors, loadError: action.payload };

    case actionTypes.VAULT_INSTRUMENT_FAILED:
        return { ...errors, vaultError: action.payload };

    case actionTypes.DELETE_INSTRUMENT_FAILED:
        return {
            ...errors,
            deleteError: action.payload,
            failedInstrument: action.meta.instrumentId,
        };

    default:
        return errors;
    }
}

/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
function statusesReducer(statuses = {}, action) {
    switch (action.type) {
    case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
        return { ...statuses, isLoading: true };

    case actionTypes.VAULT_INSTRUMENT_REQUESTED:
        return { ...statuses, isVaulting: true };

    case actionTypes.DELETE_INSTRUMENT_REQUESTED:
        return {
            ...statuses,
            isDeleting: true,
            deletingInstrument: action.meta.instrumentId,
        };

    case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
    case actionTypes.LOAD_INSTRUMENTS_FAILED:
        return { ...statuses, isLoading: false };

    case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
    case actionTypes.VAULT_INSTRUMENT_FAILED:
        return { ...statuses, isVaulting: false };

    case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
    case actionTypes.DELETE_INSTRUMENT_FAILED:
        return {
            ...statuses,
            isDeleting: false,
            deletingInstrument: undefined,
        };

    default:
        return statuses;
    }
}
