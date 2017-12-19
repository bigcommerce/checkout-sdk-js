"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var billingAddressActionTypes = require("../billing/billing-address-action-types");
var cartActionTypes = require("../cart/cart-action-types");
var couponActionTypes = require("../coupon/coupon-action-types");
var customerActionTypes = require("../customer/customer-action-types");
var giftCertificateActionTypes = require("../coupon/gift-certificate-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var shippingAddressActionTypes = require("../shipping/shipping-address-action-types");
var shippingOptionActionTypes = require("../shipping/shipping-option-action-types");
var data_store_1 = require("../../data-store");
/**
 * @param {CartState} state
 * @param {Action} action
 * @return {CartState}
 */
function cartReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = cartReducer;
/**
 * @private
 * @param {Customer} data
 * @param {Action} action
 * @return {Customer}
 */
function dataReducer(data, action) {
    if (data === void 0) { data = {}; }
    switch (action.type) {
        case cartActionTypes.CART_UPDATED:
            return action.payload ? tslib_1.__assign({}, data, action.payload) : data;
        case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
        case cartActionTypes.LOAD_CART_SUCCEEDED:
        case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
        case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
        case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        case couponActionTypes.APPLY_COUPON_SUCCEEDED:
        case couponActionTypes.REMOVE_COUPON_SUCCEEDED:
        case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED:
        case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED:
            return action.payload ? tslib_1.__assign({}, data, action.payload.cart) : data;
        default:
            return data;
    }
}
/**
 * @private
 * @param {Object} meta
 * @param {Action} action
 * @return {Object}
 */
function metaReducer(meta, action) {
    if (meta === void 0) { meta = {}; }
    switch (action.type) {
        case cartActionTypes.VERIFY_CART_SUCCEEDED:
            return tslib_1.__assign({}, meta, { isValid: action.payload });
        case cartActionTypes.LOAD_CART_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
            return tslib_1.__assign({}, meta, { isValid: true });
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
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case cartActionTypes.LOAD_CART_REQUESTED:
        case cartActionTypes.LOAD_CART_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case cartActionTypes.LOAD_CART_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case cartActionTypes.VERIFY_CART_REQUESTED:
            return tslib_1.__assign({}, errors, { verifyError: undefined });
        case cartActionTypes.VERIFY_CART_SUCCEEDED:
        case cartActionTypes.VERIFY_CART_FAILED:
            return tslib_1.__assign({}, errors, { verifyError: action.payload });
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
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case cartActionTypes.LOAD_CART_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case cartActionTypes.LOAD_CART_SUCCEEDED:
        case cartActionTypes.LOAD_CART_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case cartActionTypes.VERIFY_CART_REQUESTED:
            return tslib_1.__assign({}, statuses, { isVerifying: true });
        case cartActionTypes.VERIFY_CART_SUCCEEDED:
        case cartActionTypes.VERIFY_CART_FAILED:
            return tslib_1.__assign({}, statuses, { isVerifying: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=cart-reducer.js.map