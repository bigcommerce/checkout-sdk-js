"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var checkout_1 = require("../checkout");
var customerActionTypes = require("../customer/customer-action-types");
var orderActionTypes = require("../order/order-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var map_to_internal_customer_1 = require("./map-to-internal-customer");
function customerReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
    });
    return reducer(state, action);
}
exports.default = customerReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, data, map_to_internal_customer_1.default(action.payload, data));
        case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        case orderActionTypes.LOAD_ORDER_SUCCEEDED:
        case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
        case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
            return action.payload ? tslib_1.__assign({}, data, action.payload.customer) : data;
        default:
            return data;
    }
}
//# sourceMappingURL=customer-reducer.js.map