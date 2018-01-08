"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger = (function () {
    function Logger(console) {
        this._console = console;
    }
    Logger.prototype.log = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['log'].concat(messages));
    };
    Logger.prototype.info = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['info'].concat(messages));
    };
    Logger.prototype.warn = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['warn'].concat(messages));
    };
    Logger.prototype.error = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['error'].concat(messages));
    };
    Logger.prototype.debug = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['debug'].concat(messages));
    };
    Logger.prototype._logToConsole = function (type) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        if (!this._console || !this._console[type]) {
            return;
        }
        (_a = this._console)[type].apply(_a, messages);
        var _a;
    };
    return Logger;
}());
exports.default = Logger;
//# sourceMappingURL=logger.js.map