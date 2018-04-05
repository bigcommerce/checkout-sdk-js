"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var actionTypes = require("./remote-checkout-action-types");
function remoteCheckoutReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        meta: metaReducer,
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
//# sourceMappingURL=remote-checkout-reducer.js.map