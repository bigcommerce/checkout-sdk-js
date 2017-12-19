"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
function getShippingOptions() {
    return {
        '59a6bc597d832': [
            getFlatRateOption(),
        ],
    };
}
exports.getShippingOptions = getShippingOptions;
function getFlatRateOption() {
    return {
        description: 'Flat Rate',
        module: 'shipping_flatrate',
        method: 2,
        price: 0,
        formattedPrice: '$0.00',
        id: '0:61d4bb52f746477e1d4fb411221318c3',
        selected: true,
        imageUrl: '',
        transitTime: '',
    };
}
exports.getFlatRateOption = getFlatRateOption;
function getShippingOptionsState() {
    return {
        meta: {},
        data: getShippingOptions(),
    };
}
exports.getShippingOptionsState = getShippingOptionsState;
function getShippingOptionResponseBody() {
    return {
        data: {
            quote: quotes_mock_1.getQuote(),
            cart: carts_mock_1.getCart(),
            shippingOptions: getShippingOptions(),
        },
        meta: {},
    };
}
exports.getShippingOptionResponseBody = getShippingOptionResponseBody;
//# sourceMappingURL=shipping-options.mock.js.map