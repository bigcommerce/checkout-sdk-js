"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConsoleLogger = (function () {
    function ConsoleLogger(_console) {
        this._console = _console;
    }
    ConsoleLogger.prototype.log = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['log'].concat(messages));
    };
    ConsoleLogger.prototype.info = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['info'].concat(messages));
    };
    ConsoleLogger.prototype.warn = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['warn'].concat(messages));
    };
    ConsoleLogger.prototype.error = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['error'].concat(messages));
    };
    ConsoleLogger.prototype.debug = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['debug'].concat(messages));
    };
    ConsoleLogger.prototype._logToConsole = function (type) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        if (!this._console || !this._console[type]) {
            return;
        }
        (_a = this._console[type]).call.apply(_a, [this._console].concat(messages));
        var _a;
    };
    return ConsoleLogger;
}());
exports.default = ConsoleLogger;
//# sourceMappingURL=console-logger.js.map