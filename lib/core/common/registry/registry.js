"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../error/errors");
var Registry = (function () {
    function Registry(options) {
        this._factories = {};
        this._instances = {};
        this._options = tslib_1.__assign({ defaultToken: 'default' }, options);
    }
    Registry.prototype.get = function (token, cacheToken) {
        if (token === void 0) { token = this._options.defaultToken; }
        if (cacheToken === void 0) { cacheToken = token; }
        try {
            return this._getInstance(token, cacheToken);
        }
        catch (error) {
            return this._getInstance(this._options.defaultToken, cacheToken);
        }
    };
    Registry.prototype.register = function (token, factory) {
        if (this.hasFactory(token)) {
            throw new errors_1.InvalidArgumentError("'" + token + "' is already registered.");
        }
        this._factories[token] = factory;
    };
    Registry.prototype.hasFactory = function (token) {
        return !!this._factories[token];
    };
    Registry.prototype.hasInstance = function (token) {
        return !!this._instances[token];
    };
    Registry.prototype._getInstance = function (token, cacheToken) {
        if (!this.hasInstance(cacheToken)) {
            var factory = this._factories[token];
            if (!factory) {
                throw new errors_1.InvalidArgumentError("'" + token + "' is not registered.");
            }
            this._instances[cacheToken] = factory();
        }
        return this._instances[cacheToken];
    };
    return Registry;
}());
exports.default = Registry;
//# sourceMappingURL=registry.js.map