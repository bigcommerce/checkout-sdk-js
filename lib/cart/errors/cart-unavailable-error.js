"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var CartUnavailableError = (function (_super) {
    tslib_1.__extends(CartUnavailableError, _super);
    function CartUnavailableError() {
        var _this = _super.call(this, 'There is no available shopping cart.') || this;
        _this.type = 'cart_unavailable';
        return _this;
    }
    return CartUnavailableError;
}(errors_1.StandardError));
exports.default = CartUnavailableError;
//# sourceMappingURL=cart-unavailable-error.js.map