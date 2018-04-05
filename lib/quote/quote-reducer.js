"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var checkout_1 = require("../checkout");
var billingAddressActionTypes = require("../billing/billing-address-action-types");
var customerActionTypes = require("../customer/customer-action-types");
var quoteActionTypes = require("./quote-action-types");
var shippingAddressActionTypes = require("../shipping/shipping-address-action-types");
var shippingOptionActionTypes = require("../shipping/shipping-option-action-types");
var map_to_internal_quote_1 = require("./map-to-internal-quote");
function quoteReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = quoteReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, data, map_to_internal_quote_1.default(action.payload, data));
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
        case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
            return action.payload ? tslib_1.__assign({}, data, action.payload.quote) : data;
        default:
            return data;
    }
}
function metaReducer(meta, action) {
    switch (action.type) {
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
            return action.meta ? tslib_1.__assign({}, meta, action.meta) : meta;
        default:
            return meta;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case quoteActionTypes.LOAD_QUOTE_REQUESTED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
        case quoteActionTypes.LOAD_QUOTE_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
            return tslib_1.__assign({}, errors, { updateBillingAddressError: undefined });
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
            return tslib_1.__assign({}, errors, { updateBillingAddressError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
        case quoteActionTypes.LOAD_QUOTE_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
            return tslib_1.__assign({}, statuses, { isUpdatingBillingAddress: true });
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
            return tslib_1.__assign({}, statuses, { isUpdatingBillingAddress: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=quote-reducer.js.map