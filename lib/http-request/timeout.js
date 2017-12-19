"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Timeout = /** @class */ (function () {
    /**
     * @param {number} [delay]
     * @constructor
     */
    function Timeout(delay) {
        var _this = this;
        this._delay = delay;
        this._timeoutToken = null;
        this._promise = new Promise(function (resolve) {
            _this._resolve = resolve;
        });
    }
    /**
     * @param {Function} callback
     * @return {void}
     */
    Timeout.prototype.onComplete = function (callback) {
        this._promise.then(callback);
    };
    /**
     * @return {void}
     */
    Timeout.prototype.complete = function () {
        this._resolve();
        if (this._timeoutToken) {
            clearTimeout(this._timeoutToken);
        }
    };
    /**
     * @return {void}
     */
    Timeout.prototype.start = function () {
        var _this = this;
        if (this._delay) {
            this._timeoutToken = setTimeout(function () { return _this.complete(); }, this._delay);
        }
    };
    return Timeout;
}());
exports.default = Timeout;
//# sourceMappingURL=timeout.js.map