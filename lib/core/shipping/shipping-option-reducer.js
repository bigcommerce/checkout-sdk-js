"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var customerActionTypes = require("../customer/customer-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var shippingAddressActionTypes = require("../shipping/shipping-address-action-types");
var shippingOptionActionTypes = require("../shipping/shipping-option-action-types");
function shippingOptionReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = shippingOptionReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
            return action.payload ? action.payload.shippingOptions : data;
        default:
            return data;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED:
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_REQUESTED:
            return tslib_1.__assign({}, statuses, { isSelecting: true });
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_FAILED:
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
            return tslib_1.__assign({}, statuses, { isSelecting: false });
        default:
            return statuses;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED:
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_REQUESTED:
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
            return tslib_1.__assign({}, errors, { selectError: undefined });
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_FAILED:
            return tslib_1.__assign({}, errors, { selectError: action.payload });
        default:
            return errors;
    }
}
//# sourceMappingURL=shipping-option-reducer.js.map