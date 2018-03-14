"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("../address");
function mapToInternalQuote(checkout, existingQuote) {
    return {
        orderComment: existingQuote.orderComment,
        shippingOption: checkout.consignments[0] ? checkout.consignments[0].selectedShippingOptionId : existingQuote.shippingOption,
        billingAddress: address_1.mapToInternalAddress(checkout.billingAddress, existingQuote.billingAddress),
        shippingAddress: checkout.consignments[0] ? address_1.mapToInternalAddress(checkout.consignments[0].shippingAddress, existingQuote.shippingAddress) : existingQuote.shippingAddress,
    };
}
exports.default = mapToInternalQuote;
//# sourceMappingURL=map-to-internal-quote.js.map