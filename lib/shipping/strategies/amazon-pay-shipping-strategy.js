"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_1 = require("../../common/error/errors");
var errors_2 = require("../../remote-checkout/errors");
var shipping_strategy_1 = require("./shipping-strategy");
var AmazonPayShippingStrategy = (function (_super) {
    tslib_1.__extends(AmazonPayShippingStrategy, _super);
    function AmazonPayShippingStrategy(store, updateShippingService, _remoteCheckoutService, _scriptLoader) {
        var _this = _super.call(this, store, updateShippingService) || this;
        _this._remoteCheckoutService = _remoteCheckoutService;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayShippingStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        this._addressBookOptions = options;
        this._paymentMethod = options.paymentMethod;
        return this._updateShippingService
            .initializeShipping(options.paymentMethod.id, function () {
            return new Promise(function (resolve, reject) {
                _this._window.onAmazonPaymentsReady = function () {
                    _this._createAddressBook(options)
                        .then(function (addressBook) {
                        _this._addressBook = addressBook;
                        resolve();
                    })
                        .catch(reject);
                };
                _this._scriptLoader.loadWidget(options.paymentMethod)
                    .catch(reject);
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    AmazonPayShippingStrategy.prototype.deinitialize = function (options) {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        this._addressBook = undefined;
        this._paymentMethod = undefined;
        return _super.prototype.deinitialize.call(this, options);
    };
    AmazonPayShippingStrategy.prototype.updateAddress = function (address, options) {
        return Promise.resolve(this._store.getState());
    };
    AmazonPayShippingStrategy.prototype.selectOption = function (addressId, optionId, options) {
        return this._updateShippingService.selectOption(addressId, optionId, options);
    };
    AmazonPayShippingStrategy.prototype._createAddressBook = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var container = options.container, _a = options.onAddressSelect, onAddressSelect = _a === void 0 ? lodash_1.noop : _a, _b = options.onError, onError = _b === void 0 ? lodash_1.noop : _b, _c = options.onReady, onReady = _c === void 0 ? lodash_1.noop : _c;
            var merchantId = _this._paymentMethod && _this._paymentMethod.config.merchantId;
            if (!merchantId || !document.getElementById(container)) {
                return reject(new errors_1.NotInitializedError('Unable to create AmazonPay AddressBook widget without valid merchant ID or container ID.'));
            }
            var widget = new OffAmazonPayments.Widgets.AddressBook({
                design: {
                    designMode: 'responsive',
                },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onAddressSelect: function (orderReference) {
                    _this._handleAddressSelect(orderReference, onAddressSelect, onError);
                },
                onError: function (error) {
                    reject(error);
                    _this._handleError(error, onError);
                },
                onOrderReferenceCreate: function (orderReference) {
                    _this._handleOrderReferenceCreate(orderReference);
                },
                onReady: function () {
                    resolve();
                    onReady();
                },
            });
            widget.bind(container);
            return widget;
        });
    };
    AmazonPayShippingStrategy.prototype._handleAddressSelect = function (orderReference, callback, errorCallback) {
        if (!this._paymentMethod) {
            throw new errors_1.NotInitializedError();
        }
        var checkout = this._store.getState().checkout;
        var referenceId = checkout.getCheckoutMeta().remoteCheckout.amazon.referenceId;
        this._remoteCheckoutService.synchronizeShippingAddress(this._paymentMethod.id, { referenceId: referenceId })
            .then(function (_a) {
            var checkout = _a.checkout;
            callback(checkout.getShippingAddress());
        })
            .catch(function (error) {
            errorCallback(error);
        });
    };
    AmazonPayShippingStrategy.prototype._handleOrderReferenceCreate = function (orderReference) {
        if (!this._paymentMethod) {
            throw new errors_1.NotInitializedError();
        }
        this._remoteCheckoutService.setCheckoutMeta(this._paymentMethod.id, {
            referenceId: orderReference.getAmazonOrderReferenceId(),
        });
    };
    AmazonPayShippingStrategy.prototype._handleError = function (error, callback) {
        if (error.getErrorCode() === 'BuyerSessionExpired') {
            callback(new errors_2.RemoteCheckoutSessionError(error));
        }
        else if (error.getErrorCode() === 'InvalidAccountStatus') {
            callback(new errors_2.RemoteCheckoutAccountInvalidError(error));
        }
        else {
            callback(new errors_2.RemoteCheckoutShippingError(error));
        }
    };
    return AmazonPayShippingStrategy;
}(shipping_strategy_1.default));
exports.default = AmazonPayShippingStrategy;
//# sourceMappingURL=amazon-pay-shipping-strategy.js.map