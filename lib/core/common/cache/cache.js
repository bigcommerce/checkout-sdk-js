"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var memoize = require("memoizee");
var Cache = (function () {
    function Cache(getter) {
        if (getter === void 0) { getter = function () { }; }
        var _this = this;
        this._getter = getter;
        this._memoizedGetter = memoize(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this._getter.apply(_this, args);
        }, { length: false });
    }
    Cache.prototype.retain = function (getter) {
        this._getter = getter;
        return this;
    };
    Cache.prototype.retrieve = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this._memoizedGetter.apply(this, args);
    };
    return Cache;
}());
exports.default = Cache;
//# sourceMappingURL=cache.js.map