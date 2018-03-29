"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function bindDecorator(target, key, descriptor) {
    if (!key || !descriptor) {
        return bindClassDecorator(target);
    }
    return bindMethodDecorator(target, key, descriptor);
}
exports.default = bindDecorator;
function bindClassDecorator(target) {
    var decoratedTarget = (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return class_1;
    }(target));
    Object.getOwnPropertyNames(target.prototype)
        .forEach(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
        if (!descriptor || key === 'constructor') {
            return;
        }
        Object.defineProperty(decoratedTarget.prototype, key, bindMethodDecorator(target.prototype, key, descriptor));
    });
    return decoratedTarget;
}
exports.bindClassDecorator = bindClassDecorator;
function bindMethodDecorator(target, key, descriptor) {
    if (typeof descriptor.value !== 'function') {
        return descriptor;
    }
    var method = descriptor.value;
    return {
        get: function () {
            var boundMethod = method.bind(this);
            Object.defineProperty(this, key, tslib_1.__assign({}, descriptor, { value: boundMethod }));
            return boundMethod;
        },
        set: function (value) {
            method = value;
        },
    };
}
exports.bindMethodDecorator = bindMethodDecorator;
//# sourceMappingURL=bind-decorator.js.map