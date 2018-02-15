"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var customer_strategy_1 = require("./customer-strategy");
var AmazonPayCustomerStrategy = (function (_super) {
    tslib_1.__extends(AmazonPayCustomerStrategy, _super);
    function AmazonPayCustomerStrategy(store, signInCustomerService, _requestSender, _scriptLoader) {
        var _this = _super.call(this, store, signInCustomerService) || this;
        _this._requestSender = _requestSender;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayCustomerStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        this._paymentMethod = options.paymentMethod;
        this._window.onAmazonPaymentsReady = function () {
            _this._signInButton = _this._createSignInButton(options);
        };
        return this._scriptLoader.loadWidget(this._paymentMethod)
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
        if (!this._isInitialized) {
            throw new errors_1.NotInitializedError();
        }
        return this._signInCustomerService.remoteSignOut(this._paymentMethod.id, options);
    };
    AmazonPayCustomerStrategy.prototype._createSignInButton = function (options) {
        var _this = this;
        var _a = this._paymentMethod, config = _a.config, initializationData = _a.initializationData;
        return new OffAmazonPayments.Button(options.container, config.merchantId, {
            color: options.color || 'Gold',
            size: options.size || 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
            authorization: function () { return _this._authorizeClient(initializationData); },
        });
    };
    AmazonPayCustomerStrategy.prototype._authorizeClient = function (options) {
        var _this = this;
        return this._requestSender.generateToken()
            .then(function (_a) {
            var body = _a.body;
            amazon.Login.authorize({
                popup: false,
                scope: 'payments:shipping_address payments:billing_address payments:widget profile',
                state: "" + options.tokenPrefix + body.token,
            }, options.redirectUrl);
            _this._requestSender.trackAuthorizationEvent();
        });
    };
    return AmazonPayCustomerStrategy;
}(customer_strategy_1.default));
exports.default = AmazonPayCustomerStrategy;
//# sourceMappingURL=amazon-pay-customer-strategy.js.map