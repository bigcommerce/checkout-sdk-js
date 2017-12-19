"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger = /** @class */ (function () {
    /**
     * @constructor
     * @param {console} console
     */
    function Logger(console) {
        this._console = console;
    }
    /**
     * @param {...any} messages
     * @return {void}
     */
    Logger.prototype.log = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['log'].concat(messages));
    };
    /**
     * @param {...any} messages
     * @return {void}
     */
    Logger.prototype.info = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['info'].concat(messages));
    };
    /**
     * @param {...any} messages
     * @return {void}
     */
    Logger.prototype.warn = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['warn'].concat(messages));
    };
    /**
     * @param {...any} messages
     * @return {void}
     */
    Logger.prototype.error = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['error'].concat(messages));
    };
    /**
     * @param {...any} messages
     * @return {void}
     */
    Logger.prototype.debug = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['debug'].concat(messages));
    };
    /**
     * @param {string} type
     * @param {...any} messages
     * @return {void}
     */
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