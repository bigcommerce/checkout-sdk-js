"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SDK_URL = '//credit.klarnacdn.net/lib/v1/api.js';
var KlarnaScriptLoader = (function () {
    function KlarnaScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    KlarnaScriptLoader.prototype.load = function () {
        var _this = this;
        var windowObject = window;
        if (!this._loadPromise) {
            this._loadPromise = this._scriptLoader.loadScript(SDK_URL)
                .then(function () { return windowObject.Klarna && windowObject.Klarna.Credit; })
                .catch(function () { _this._loadPromise = undefined; });
        }
        return this._loadPromise;
    };
    return KlarnaScriptLoader;
}());
exports.default = KlarnaScriptLoader;
//# sourceMappingURL=klarna-script-loader.js.map