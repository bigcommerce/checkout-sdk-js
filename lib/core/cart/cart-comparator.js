"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var utility_1 = require("../common/utility");
var CartComparator = /** @class */ (function () {
    function CartComparator() {
    }
    /**
     * @param {Cart} cartA
     * @param {Cart} cartB
     * @return {boolean}
     */
    CartComparator.prototype.isEqual = function (cartA, cartB) {
        return lodash_1.isEqual(this._normalize(cartA), this._normalize(cartB));
    };
    /**
     * @param {Cart} cart
     * @return {Cart}
     */
    CartComparator.prototype._normalize = function (cart) {
        return utility_1.omitPrivate(tslib_1.__assign({}, cart, { items: cart.items && cart.items.map(function (item) { return lodash_1.omit(item, ['id', 'imageUrl']); }) }));
    };
    return CartComparator;
}());
exports.default = CartComparator;
//# sourceMappingURL=cart-comparator.js.map