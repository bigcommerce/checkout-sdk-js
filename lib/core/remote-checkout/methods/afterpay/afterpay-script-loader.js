"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SCRIPT_PROD = '//www.secure-afterpay.com.au/afterpay-async.js';
var SCRIPT_SANDBOX = '//www-sandbox.secure-afterpay.com.au/afterpay-async.js';
var AfterpayScriptLoader = (function () {
    function AfterpayScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    AfterpayScriptLoader.prototype.load = function (method) {
        var testMode = method.config.testMode;
        var scriptURI = testMode ? SCRIPT_SANDBOX : SCRIPT_PROD;
        return this._scriptLoader.loadScript(scriptURI)
            .then(function () { return window.AfterPay; });
    };
    return AfterpayScriptLoader;
}());
exports.default = AfterpayScriptLoader;
//# sourceMappingURL=afterpay-script-loader.js.map