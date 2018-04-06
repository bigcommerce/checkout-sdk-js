"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var errors_1 = require("./errors");
var RequestErrorFactory = (function () {
    function RequestErrorFactory() {
        this._factoryMethods = {};
        this.register('default', function (response, message) { return new errors_1.RequestError(response, message); });
        this.register('timeout', function (response) { return new errors_1.TimeoutError(response); });
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
            return lodash_1.last(body.type.split('/')) || 'default';
        }
        return (lodash_1.last(body.errors) || {}).code || 'default';
    };
    return RequestErrorFactory;
}());
exports.default = RequestErrorFactory;
//# sourceMappingURL=request-error-factory.js.map