"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param {Function} target
 * @param {Function|Object} mixins
 * @return {void}
 */
function applyMixin(target) {
    var mixins = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        mixins[_i - 1] = arguments[_i];
    }
    mixins.forEach(function (mixin) {
        var methods = mixin.prototype || mixin;
        Object.getOwnPropertyNames(methods).forEach(function (name) {
            target.prototype[name] = methods[name];
        });
    });
}
exports.default = applyMixin;
//# sourceMappingURL=apply-mixin.js.map