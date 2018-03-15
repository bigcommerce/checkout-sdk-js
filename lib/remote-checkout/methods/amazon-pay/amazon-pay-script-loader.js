"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AmazonPayScriptLoader = (function () {
    function AmazonPayScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
        this._window = window;
    }
    AmazonPayScriptLoader.prototype.loadWidget = function (method, onPaymentReady) {
        var _a = method.config, merchantId = _a.merchantId, testMode = _a.testMode, _b = method.initializationData, _c = (_b === void 0 ? {} : _b).region, region = _c === void 0 ? 'us' : _c;
        var url = 'https://' +
            (region.toLowerCase() !== 'us' ? 'static-eu.' : 'static-na.') +
            'payments-amazon.com/OffAmazonPayments/' +
            (region.toLowerCase() + "/") +
            (testMode ? 'sandbox/' : '') +
            (region.toLowerCase() !== 'us' ? 'lpa/' : '') +
            ("js/Widgets.js?sellerId=" + merchantId);
        this._configureWidget(method, onPaymentReady);
        return this._scriptLoader.loadScript(url);
    };
    AmazonPayScriptLoader.prototype._configureWidget = function (method, onPaymentReady) {
        var onLoginReady = function () {
            amazon.Login.setClientId(method.initializationData.clientId);
            amazon.Login.setUseCookie(true);
        };
        if (this._window.amazon && this._window.amazon.Login) {
            onLoginReady();
        }
        else {
            this._window.onAmazonLoginReady = onLoginReady;
        }
        if (this._window.OffAmazonPayments && onPaymentReady) {
            onPaymentReady();
        }
        else {
            this._window.onAmazonPaymentsReady = onPaymentReady;
        }
    };
    return AmazonPayScriptLoader;
}());
exports.default = AmazonPayScriptLoader;
//# sourceMappingURL=amazon-pay-script-loader.js.map