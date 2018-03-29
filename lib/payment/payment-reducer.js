"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var actionTypes = require("./payment-action-types");
function paymentReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
    });
    return reducer(state, action);
}
exports.default = paymentReducer;
function dataReducer(data, action) {
    if (data === void 0) { data = {}; }
    switch (action.type) {
        case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
            return action.payload;
        default:
            return data;
    }
}
//# sourceMappingURL=payment-reducer.js.map