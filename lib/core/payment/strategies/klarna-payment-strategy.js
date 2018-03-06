"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payment_strategy_1 = require("./payment-strategy");
var KlarnaPaymentStrategy = (function (_super) {
    tslib_1.__extends(KlarnaPaymentStrategy, _super);
    function KlarnaPaymentStrategy(store, placeOrderService, _remoteCheckoutService, _klarnaScriptLoader) {
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._remoteCheckoutService = _remoteCheckoutService;
        _this._klarnaScriptLoader = _klarnaScriptLoader;
        return _this;
    }
    KlarnaPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        return this._klarnaScriptLoader.load()
            .then(function (klarnaSdk) { _this._klarnaSdk = klarnaSdk; })
            .then(function () {
            _this._unsubscribe = _this._store.subscribe(function () { return _this._loadWidget(options); }, function (_a) {
                var checkout = _a.checkout;
                return checkout.getCart() && checkout.getCart().grandTotal;
            });
            return _this._loadWidget(options);
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    KlarnaPaymentStrategy.prototype.deinitialize = function (options) {
        this._klarnaSdk = undefined;
        if (this._unsubscribe) {
            this._unsubscribe();
        }
        return _super.prototype.deinitialize.call(this, options);
    };
    KlarnaPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        return this._authorize()
            .then(function (res) {
            var authorizationToken = res.authorization_token;
            return _this._remoteCheckoutService.initializePayment(payload.payment.name, { authorizationToken: authorizationToken });
        })
            .then(function () {
            return _this._placeOrderService.submitOrder(tslib_1.__assign({}, payload, { payment: lodash_1.omit(payload.payment, 'paymentData'), useStoreCredit: false }), options);
        });
    };
    KlarnaPaymentStrategy.prototype._loadWidget = function (options) {
        var _this = this;
        var container = options.container, loadCallback = options.loadCallback;
        var paymentId = options.paymentMethod.id;
        return this._placeOrderService.loadPaymentMethod(paymentId)
            .then(function (resp) {
            var clientToken = resp.checkout.getPaymentMethod(paymentId).clientToken;
            return _this._klarnaSdk.init({ client_token: clientToken });
        })
            .then(function () { return _this._klarnaSdk.load({ container: container }, loadCallback); });
    };
    KlarnaPaymentStrategy.prototype._authorize = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._klarnaSdk.authorize({}, function (res) {
                if (!res.approved) {
                    reject(res);
                }
                else {
                    resolve(res);
                }
            });
        });
    };
    return KlarnaPaymentStrategy;
}(payment_strategy_1.default));
exports.default = KlarnaPaymentStrategy;
//# sourceMappingURL=klarna-payment-strategy.js.map