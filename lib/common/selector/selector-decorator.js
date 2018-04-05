"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var utility_1 = require("../utility");
var cache_key_resolver_1 = require("./cache-key-resolver");
function selectorDecorator(target) {
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
        Object.defineProperty(decoratedTarget.prototype, key, selectorMethodDecorator(target.prototype, key, descriptor));
    });
    return decoratedTarget;
}
exports.default = selectorDecorator;
function selectorMethodDecorator(target, key, descriptor) {
    if (typeof descriptor.value !== 'function') {
        return descriptor;
    }
    var resolver = new cache_key_resolver_1.default();
    var method = descriptor.value;
    var memoizedMethod = lodash_1.memoize(method, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return resolver.getKey.apply(resolver, args);
    });
    return utility_1.bindDecorator(target, key, {
        get: function () {
            var _this = this;
            var value = (function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var cachedValue = memoizedMethod.call.apply(memoizedMethod, [_this].concat(args));
                if (resolver.getUsedCount.apply(resolver, args) === 1) {
                    return cachedValue;
                }
                var newValue = method.call.apply(method, [_this].concat(args));
                if (lodash_1.isEqual(newValue, cachedValue)) {
                    return cachedValue;
                }
                memoizedMethod.cache.set(resolver.getKey.apply(resolver, args), newValue);
                return newValue;
            });
            Object.defineProperty(this, key, tslib_1.__assign({}, descriptor, { value: value }));
            return value;
        },
        set: function (value) {
            resolver = new cache_key_resolver_1.default();
            method = value;
            memoizedMethod = lodash_1.memoize(method, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return resolver.getKey.apply(resolver, args);
            });
        },
    });
}
//# sourceMappingURL=selector-decorator.js.map