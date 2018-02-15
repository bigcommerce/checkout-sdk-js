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
    Registry.prototype.get = function (token) {
        if (token === void 0) { token = this._options.defaultToken; }
        try {
            return this._getInstance(token);
        }
        catch (error) {
            return this._getInstance(this._options.defaultToken);
        }
    };
    Registry.prototype.register = function (token, factory) {
        if (this._factories[token]) {
            throw new errors_1.InvalidArgumentError();
        }
        this._factories[token] = factory;
    };
    Registry.prototype._getInstance = function (token) {
        if (!this._instances[token]) {
            var factory = this._factories[token];
            if (!factory) {
                throw new errors_1.InvalidArgumentError();
            }
            this._instances[token] = factory();
        }
        return this._instances[token];
    };
    return Registry;
}());
exports.default = Registry;
//# sourceMappingURL=registry.js.map