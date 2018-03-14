"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var actionTypes = require("./instrument-action-types");
function instrumentReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = instrumentReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
            return action.payload.vaulted_instruments || [];
        case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
            return (data || []).concat([action.payload.vaulted_instrument]);
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
            return (data || []).filter(function (instrument) {
                return instrument.bigpay_token !== action.payload.instrumentId;
            });
        default:
            return data;
    }
}
function metaReducer(meta, action) {
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
            return tslib_1.__assign({}, meta, action.meta);
        default:
            return meta;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.VAULT_INSTRUMENT_REQUESTED:
        case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
            return tslib_1.__assign({}, errors, { vaultError: undefined });
        case actionTypes.DELETE_INSTRUMENT_REQUESTED:
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
            return tslib_1.__assign({}, errors, { deleteError: undefined, failedInstrument: undefined });
        case actionTypes.LOAD_INSTRUMENTS_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case actionTypes.VAULT_INSTRUMENT_FAILED:
            return tslib_1.__assign({}, errors, { vaultError: action.payload });
        case actionTypes.DELETE_INSTRUMENT_FAILED:
            return tslib_1.__assign({}, errors, { deleteError: action.payload, failedInstrument: action.meta.instrumentId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.VAULT_INSTRUMENT_REQUESTED:
            return tslib_1.__assign({}, statuses, { isVaulting: true });
        case actionTypes.DELETE_INSTRUMENT_REQUESTED:
            return tslib_1.__assign({}, statuses, { isDeleting: true, deletingInstrument: action.meta.instrumentId });
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        case actionTypes.LOAD_INSTRUMENTS_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case actionTypes.VAULT_INSTRUMENT_SUCCEEDED:
        case actionTypes.VAULT_INSTRUMENT_FAILED:
            return tslib_1.__assign({}, statuses, { isVaulting: false });
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
        case actionTypes.DELETE_INSTRUMENT_FAILED:
            return tslib_1.__assign({}, statuses, { isDeleting: false, deletingInstrument: undefined });
        default:
            return statuses;
    }
}
//# sourceMappingURL=instrument-reducer.js.map