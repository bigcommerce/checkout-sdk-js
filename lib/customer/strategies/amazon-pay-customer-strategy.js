"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require("rxjs/add/observable/empty");
var errors_1 = require("../../common/error/errors");
var errors_2 = require("../../remote-checkout/errors");
var customer_strategy_1 = require("./customer-strategy");
var AmazonPayCustomerStrategy = (function (_super) {
    tslib_1.__extends(AmazonPayCustomerStrategy, _super);
    function AmazonPayCustomerStrategy(store, _paymentMethodActionCreator, _remoteCheckoutActionCreator, _remoteCheckoutRequestSender, _scriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._remoteCheckoutRequestSender = _remoteCheckoutRequestSender;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayCustomerStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId))
            .then(function (_a) {
            var checkout = _a.checkout;
            return new Promise(function (resolve, reject) {
                _this._paymentMethod = checkout.getPaymentMethod(options.methodId);
                var _a = options.onError, onError = _a === void 0 ? function () { } : _a;
                var onReady = function () {
                    _this._signInButton = _this._createSignInButton(tslib_1.__assign({}, options, { onError: function (error) {
                            reject(error);
                            onError(error);
                        } }));
                    resolve();
                };
                _this._scriptLoader.loadWidget(_this._paymentMethod, onReady)
                    .catch(reject);
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    AmazonPayCustomerStrategy.prototype.deinitialize = function (options) {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        this._signInButton = undefined;
        this._paymentMethod = undefined;
        return _super.prototype.deinitialize.call(this, options);
    };
    AmazonPayCustomerStrategy.prototype.signIn = function (credentials, options) {
        throw new errors_1.NotImplementedError('In order to sign in via AmazonPay, the shopper must click on "Login with Amazon" button.');
    };
    AmazonPayCustomerStrategy.prototype.signOut = function (options) {
        var checkout = this._store.getState().checkout;
        var _a = (checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
        if (!remote.provider) {
            return Promise.resolve(this._store.getState());
        }
        return this._store.dispatch(this._remoteCheckoutActionCreator.signOut(remote.provider, options));
    };
    AmazonPayCustomerStrategy.prototype._createSignInButton = function (options) {
        var _this = this;
        if (!this._paymentMethod) {
            throw new errors_1.NotInitializedError();
        }
        var _a = options.onError, onError = _a === void 0 ? function () { } : _a;
        var _b = this._paymentMethod, config = _b.config, initializationData = _b.initializationData;
        return new OffAmazonPayments.Button(options.container, config.merchantId, {
            color: options.color || 'Gold',
            size: options.size || 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
            authorization: function () {
                _this._handleAuthorization(initializationData);
            },
            onError: function (error) {
                _this._handleError(error, onError);
            },
        });
    };
    AmazonPayCustomerStrategy.prototype._handleAuthorization = function (options) {
        var _this = this;
        this._remoteCheckoutRequestSender.generateToken()
            .then(function (_a) {
            var body = _a.body;
            amazon.Login.authorize({
                popup: false,
                scope: 'payments:shipping_address payments:billing_address payments:widget profile',
                state: "" + options.tokenPrefix + body.token,
            }, options.redirectUrl);
            _this._remoteCheckoutRequestSender.trackAuthorizationEvent();
        });
    };
    AmazonPayCustomerStrategy.prototype._handleError = function (error, callback) {
        if (!error) {
            return;
        }
        callback(new errors_2.RemoteCheckoutCustomerError(error));
    };
    return AmazonPayCustomerStrategy;
}(customer_strategy_1.default));
exports.default = AmazonPayCustomerStrategy;
//# sourceMappingURL=amazon-pay-customer-strategy.js.map