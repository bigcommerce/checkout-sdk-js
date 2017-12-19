"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var couponActionTypes = require("./coupon-action-types");
var data_store_1 = require("../../data-store");
/**
 * @param {CouponState} state
 * @param {Action} action
 * @return {CouponState}
 */
function couponReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = couponReducer;
/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case couponActionTypes.APPLY_COUPON_REQUESTED:
        case couponActionTypes.APPLY_COUPON_SUCCEEDED:
            return tslib_1.__assign({}, errors, { applyCouponError: undefined });
        case couponActionTypes.APPLY_COUPON_FAILED:
            return tslib_1.__assign({}, errors, { applyCouponError: action.payload });
        case couponActionTypes.REMOVE_COUPON_REQUESTED:
        case couponActionTypes.REMOVE_COUPON_SUCCEEDED:
            return tslib_1.__assign({}, errors, { removeCouponError: undefined });
        case couponActionTypes.REMOVE_COUPON_FAILED:
            return tslib_1.__assign({}, errors, { removeCouponError: action.payload });
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
        case couponActionTypes.APPLY_COUPON_REQUESTED:
            return tslib_1.__assign({}, statuses, { isApplyingCoupon: true });
        case couponActionTypes.APPLY_COUPON_SUCCEEDED:
        case couponActionTypes.APPLY_COUPON_FAILED:
            return tslib_1.__assign({}, statuses, { isApplyingCoupon: false });
        case couponActionTypes.REMOVE_COUPON_REQUESTED:
            return tslib_1.__assign({}, statuses, { isRemovingCoupon: true });
        case couponActionTypes.REMOVE_COUPON_SUCCEEDED:
        case couponActionTypes.REMOVE_COUPON_FAILED:
            return tslib_1.__assign({}, statuses, { isRemovingCoupon: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=coupon-reducer.js.map