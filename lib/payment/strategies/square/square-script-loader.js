"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SquareScriptLoader = (function () {
    function SquareScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    SquareScriptLoader.prototype.load = function () {
        var scriptURI = '//js.squareup.com/v2/paymentform';
        if (!this._loadPromise) {
            this._loadPromise = this._scriptLoader.loadScript(scriptURI)
                .then(function () { return function (options) {
                return new window.SqPaymentForm(options);
            }; });
        }
        return this._loadPromise;
    };
    return SquareScriptLoader;
}());
exports.default = SquareScriptLoader;
//# sourceMappingURL=square-script-loader.js.map