"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var is_vaulted_instrument_1 = require("./is-vaulted-instrument");
function isCreditCardLike(creditCard) {
    var card = creditCard;
    return !is_vaulted_instrument_1.default(card) &&
        typeof card.ccName === 'string' &&
        typeof card.ccNumber === 'string' &&
        typeof card.ccType === 'string' &&
        typeof card.ccExpiry === 'object' &&
        typeof card.ccExpiry.month === 'string' &&
        typeof card.ccExpiry.year === 'string';
}
exports.default = isCreditCardLike;
//# sourceMappingURL=is-credit-card.js.map