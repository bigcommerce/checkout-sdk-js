"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AmazonPayScriptLoader = (function () {
    function AmazonPayScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
        this._window = window;
    }
    AmazonPayScriptLoader.prototype.loadWidget = function (method) {
        var _a = method.config, merchantId = _a.merchantId, testMode = _a.testMode, _b = method.initializationData, _c = (_b === void 0 ? {} : _b).region, region = _c === void 0 ? 'us' : _c;
        var url = 'https://static-na.payments-amazon.com/OffAmazonPayments/' +
            (region.toLowerCase() + "/") +
            (testMode ? 'sandbox/' : '') +
            (region.toLowerCase() !== 'us' ? 'lpa/' : '') +
            ("js/Widgets.js?sellerId=" + merchantId);
        this._configureWidget(method);
        return this._scriptLoader.loadScript(url);
    };
    AmazonPayScriptLoader.prototype._configureWidget = function (method) {
        if (this._window.onAmazonLoginReady) {
            return;
        }
        this._window.onAmazonLoginReady = function () {
            amazon.Login.setClientId(method.initializationData.clientId);
            amazon.Login.setUseCookie(true);
        };
    };
    return AmazonPayScriptLoader;
}());
exports.default = AmazonPayScriptLoader;
//# sourceMappingURL=amazon-pay-script-loader.js.map