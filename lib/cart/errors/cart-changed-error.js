"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var CartChangedError = (function (_super) {
    tslib_1.__extends(CartChangedError, _super);
    function CartChangedError() {
        var _this = _super.call(this, 'An update to your shopping cart has been detected and your available shipping costs have been updated.') || this;
        _this.type = 'cart_changed';
        return _this;
    }
    return CartChangedError;
}(errors_1.StandardError));
exports.default = CartChangedError;
//# sourceMappingURL=cart-changed-error.js.map