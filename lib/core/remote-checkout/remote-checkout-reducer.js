"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var actionTypes = require("./remote-checkout-action-types");
var data_store_1 = require("../../data-store");
function remoteCheckoutReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = remoteCheckoutReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
            return tslib_1.__assign({}, data, { billingAddress: action.payload.billing && action.payload.billing.address });
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
            return tslib_1.__assign({}, data, { shippingAddress: action.payload.shipping && action.payload.shipping.address });
        case actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED:
            return tslib_1.__assign({}, data, { isPaymentInitialized: action.payload.payment });
        default:
            return data;
    }
}
function metaReducer(meta, action) {
    switch (action.type) {
        case actionTypes.SET_REMOTE_CHECKOUT_META:
            return tslib_1.__assign({}, meta, action.payload);
        default:
            return meta;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED:
        case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
            return tslib_1.__assign({}, errors, { failedBillingMethod: undefined, initializeBillingError: undefined });
        case actionTypes.INITIALIZE_REMOTE_BILLING_FAILED:
            return tslib_1.__assign({}, errors, { failedBillingMethod: action.meta && action.meta.methodId, initializeBillingError: action.payload });
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED:
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
            return tslib_1.__assign({}, errors, { failedShippingMethod: undefined, initializeShippingError: undefined });
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED:
            return tslib_1.__assign({}, errors, { failedShippingMethod: action.meta && action.meta.methodId, initializeShippingError: action.payload });
        case actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED:
        case actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED:
            return tslib_1.__assign({}, errors, { failedPaymentMethod: undefined, initializePaymentError: undefined });
        case actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED:
            return tslib_1.__assign({}, errors, { failedPaymentMethod: action.meta && action.meta.methodId, initializePaymentError: action.payload });
        case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED:
        case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED:
            return tslib_1.__assign({}, errors, { signOutError: undefined });
        case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED:
            return tslib_1.__assign({}, errors, { signOutError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED:
            return tslib_1.__assign({}, statuses, { isInitializingBilling: true, loadingBillingMethod: action.meta && action.meta.methodId });
        case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
        case actionTypes.INITIALIZE_REMOTE_BILLING_FAILED:
            return tslib_1.__assign({}, statuses, { isInitializingBilling: false, loadingBillingMethod: undefined });
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED:
            return tslib_1.__assign({}, statuses, { isInitializingShipping: true, loadingShippingMethod: action.meta && action.meta.methodId });
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED:
            return tslib_1.__assign({}, statuses, { isInitializingShipping: false, loadingShippingMethod: undefined });
        case actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED:
            return tslib_1.__assign({}, statuses, { isInitializingPayment: true, loadingPaymentMethod: action.meta && action.meta.methodId });
        case actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED:
        case actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED:
            return tslib_1.__assign({}, statuses, { isInitializingPayment: false, loadingPaymentMethod: undefined });
        case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED:
            return tslib_1.__assign({}, statuses, { isSigningOut: true });
        case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED:
        case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED:
            return tslib_1.__assign({}, statuses, { isSigningOut: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=remote-checkout-reducer.js.map