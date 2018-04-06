"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BraintreeScriptLoader = (function () {
    function BraintreeScriptLoader(_scriptLoader, _window) {
        if (_window === void 0) { _window = window; }
        this._scriptLoader = _scriptLoader;
        this._window = _window;
    }
    BraintreeScriptLoader.prototype.loadClient = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/client.min.js')
            .then(function () { return _this._window.braintree.client; });
    };
    BraintreeScriptLoader.prototype.load3DS = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/three-d-secure.min.js')
            .then(function () { return _this._window.braintree.threeDSecure; });
    };
    BraintreeScriptLoader.prototype.loadDataCollector = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/data-collector.min.js')
            .then(function () { return _this._window.braintree.dataCollector; });
    };
    BraintreeScriptLoader.prototype.loadPaypal = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/paypal.min.js')
            .then(function () { return _this._window.braintree.paypal; });
    };
    return BraintreeScriptLoader;
}());
exports.default = BraintreeScriptLoader;
//# sourceMappingURL=braintree-script-loader.js.map