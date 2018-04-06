"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var checkout_1 = require("../checkout");
var DEFAULT_STATE = {};
function billingAddressReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
    });
    return reducer(state, action);
}
exports.default = billingAddressReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return action.payload ? action.payload.billingAddress : data;
        default:
            return data;
    }
}
//# sourceMappingURL=billing-address-reducer.js.map