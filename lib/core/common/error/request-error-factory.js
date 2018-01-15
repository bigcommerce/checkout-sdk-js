"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var errors_1 = require("./errors");
var RequestErrorFactory = (function () {
    function RequestErrorFactory() {
        this._factoryMethods = {};
        this.register('default', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (errors_1.RequestError.bind.apply(errors_1.RequestError, [void 0].concat(args)))();
        });
        this.register('timeout', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (errors_1.TimeoutError.bind.apply(errors_1.TimeoutError, [void 0].concat(args)))();
        });
    }
    RequestErrorFactory.prototype.register = function (type, factoryMethod) {
        this._factoryMethods[type] = factoryMethod;
    };
    RequestErrorFactory.prototype.createError = function (response, message) {
        var factoryMethod = this._factoryMethods[this._getType(response)] || this._factoryMethods.default;
        return factoryMethod(response, message);
    };
    RequestErrorFactory.prototype._getType = function (response) {
        if (response.status === 0) {
            return 'timeout';
        }
        var _a = response.body, body = _a === void 0 ? {} : _a;
        if (typeof body.type === 'string') {
            return lodash_1.last(body.type.split('/'));
        }
        return (lodash_1.last(body.errors) || {}).code;
    };
    return RequestErrorFactory;
}());
exports.default = RequestErrorFactory;
//# sourceMappingURL=request-error-factory.js.map