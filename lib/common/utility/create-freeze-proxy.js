"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
function createFreezeProxy(target) {
    return createProxy(target, function (target, name) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return data_store_1.deepFreeze((_a = target[name]).call.apply(_a, [target].concat(args)));
            var _a;
        };
    });
}
exports.default = createFreezeProxy;
function createProxy(target, trap) {
    var proxy = Object.create(target);
    traversePrototypeOf(target, function (prototype) {
        Object.getOwnPropertyNames(prototype)
            .forEach(function (name) {
            if (name === 'constructor' || typeof proxy[name] !== 'function' || name.charAt(0) === '_') {
                return;
            }
            proxy[name] = trap(target, name, proxy);
        });
    });
    return proxy;
}
function traversePrototypeOf(target, iteratee) {
    var prototype = Object.getPrototypeOf(target);
    while (prototype) {
        iteratee(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }
}
//# sourceMappingURL=create-freeze-proxy.js.map