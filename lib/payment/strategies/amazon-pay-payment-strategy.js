"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var address_1 = require("../../address");
var errors_1 = require("../../common/error/errors");
var errors_2 = require("../../remote-checkout/errors");
var payment_strategy_1 = require("./payment-strategy");
var AmazonPayPaymentStrategy = (function (_super) {
    tslib_1.__extends(AmazonPayPaymentStrategy, _super);
    function AmazonPayPaymentStrategy(store, placeOrderService, _billingAddressActionCreator, _remoteCheckoutActionCreator, _scriptLoader) {
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._billingAddressActionCreator = _billingAddressActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        this._walletOptions = options;
        this._paymentMethod = options.paymentMethod;
        return new Promise(function (resolve, reject) {
            var onReady = function () {
                _this._createWallet(options)
                    .then(function (wallet) {
                    _this._wallet = wallet;
                    resolve();
                })
                    .catch(reject);
            };
            _this._scriptLoader.loadWidget(options.paymentMethod, onReady)
                .catch(reject);
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    AmazonPayPaymentStrategy.prototype.deinitialize = function (options) {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        this._wallet = undefined;
        this._walletOptions = undefined;
        return _super.prototype.deinitialize.call(this, options);
    };
    AmazonPayPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var _a = payload.useStoreCredit, useStoreCredit = _a === void 0 ? false : _a;
        var referenceId = this._getOrderReferenceId();
        if (!referenceId) {
            throw new errors_1.NotInitializedError('Unable to submit payment without order reference ID');
        }
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(payload.payment.name, { referenceId: referenceId, useStoreCredit: useStoreCredit }))
            .then(function () {
            return _this._placeOrderService.submitOrder(tslib_1.__assign({}, payload, { payment: lodash_1.omit(payload.payment, 'paymentData') }), true, options);
        })
            .catch(function (error) {
            if (error instanceof errors_1.RequestError && error.body.type === 'provider_widget_error' && _this._walletOptions) {
                return _this._createWallet(_this._walletOptions)
                    .then(function (wallet) {
                    _this._wallet = wallet;
                    return Promise.reject(error);
                });
            }
            return Promise.reject(error);
        });
    };
    AmazonPayPaymentStrategy.prototype._getMerchantId = function () {
        return this._paymentMethod && this._paymentMethod.config.merchantId;
    };
    AmazonPayPaymentStrategy.prototype._getOrderReferenceId = function () {
        var checkout = this._store.getState().checkout;
        var _a = checkout.getCheckoutMeta().remoteCheckout, _b = (_a === void 0 ? {} : _a).amazon, amazon = _b === void 0 ? {} : _b;
        return amazon.referenceId;
    };
    AmazonPayPaymentStrategy.prototype._createWallet = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var container = options.container, _a = options.onError, onError = _a === void 0 ? lodash_1.noop : _a, _b = options.onPaymentSelect, onPaymentSelect = _b === void 0 ? lodash_1.noop : _b, _c = options.onReady, onReady = _c === void 0 ? lodash_1.noop : _c;
            var referenceId = _this._getOrderReferenceId();
            var merchantId = _this._getMerchantId();
            if (!merchantId || !document.getElementById(container)) {
                return reject(new errors_1.NotInitializedError('Unable to create AmazonPay Wallet widget without valid merchant ID or container ID.'));
            }
            var walletOptions = {
                design: { designMode: 'responsive' },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onError: function (error) {
                    reject(error);
                    _this._handleError(error, onError);
                },
                onPaymentSelect: function (orderReference) {
                    _this._handlePaymentSelect(orderReference, onPaymentSelect);
                },
                onReady: function () {
                    resolve();
                    onReady();
                },
            };
            if (referenceId) {
                walletOptions.amazonOrderReferenceId = referenceId;
            }
            else {
                walletOptions.onOrderReferenceCreate = function (orderReference) {
                    _this._store.dispatch(_this._remoteCheckoutActionCreator.setCheckoutMeta(_this._paymentMethod.id, {
                        referenceId: orderReference.getAmazonOrderReferenceId(),
                    }));
                };
            }
            var widget = new OffAmazonPayments.Widgets.Wallet(walletOptions);
            widget.bind(container);
            return widget;
        });
    };
    AmazonPayPaymentStrategy.prototype._synchronizeBillingAddress = function () {
        var _this = this;
        var referenceId = this._getOrderReferenceId();
        var methodId = this._paymentMethod && this._paymentMethod.id;
        if (!methodId || !referenceId) {
            throw new errors_1.NotInitializedError();
        }
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializeBilling(methodId, { referenceId: referenceId }))
            .then(function (_a) {
            var checkout = _a.checkout;
            var _b = checkout.getCheckoutMeta().remoteCheckout, remoteCheckout = _b === void 0 ? {} : _b;
            if (remoteCheckout.billingAddress === false) {
                throw new errors_2.RemoteCheckoutSynchronizationError();
            }
            if (address_1.isAddressEqual(remoteCheckout.billingAddress, checkout.getBillingAddress()) || !remoteCheckout.billingAddress) {
                return _this._store.getState();
            }
            return _this._store.dispatch(_this._billingAddressActionCreator.updateAddress(remoteCheckout.billingAddress));
        });
    };
    AmazonPayPaymentStrategy.prototype._handlePaymentSelect = function (orderReference, callback) {
        this._synchronizeBillingAddress()
            .then(function (_a) {
            var checkout = _a.checkout;
            return callback(checkout.getBillingAddress());
        });
    };
    AmazonPayPaymentStrategy.prototype._handleError = function (error, callback) {
        if (error.getErrorCode() === 'BuyerSessionExpired') {
            callback(new errors_2.RemoteCheckoutSessionError(error));
        }
        else {
            callback(new errors_2.RemoteCheckoutPaymentError(error));
        }
    };
    return AmazonPayPaymentStrategy;
}(payment_strategy_1.default));
exports.default = AmazonPayPaymentStrategy;
//# sourceMappingURL=amazon-pay-payment-strategy.js.map