"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../../../common/error/errors");
var BraintreeSDKCreator = (function () {
    function BraintreeSDKCreator(_braintreeScriptLoader) {
        this._braintreeScriptLoader = _braintreeScriptLoader;
    }
    BraintreeSDKCreator.prototype.initialize = function (clientToken) {
        this._clientToken = clientToken;
    };
    BraintreeSDKCreator.prototype.getClient = function () {
        var _this = this;
        if (!this._clientToken) {
            throw new errors_1.NotInitializedError();
        }
        if (!this._client) {
            this._client = this._braintreeScriptLoader.loadClient()
                .then(function (client) { return client.create({ authorization: _this._clientToken }); });
        }
        return this._client;
    };
    BraintreeSDKCreator.prototype.get3DS = function () {
        if (!this._3ds) {
            this._3ds = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.load3DS(),
            ])
                .then(function (_a) {
                var client = _a[0], threeDSecure = _a[1];
                return threeDSecure.create({ client: client });
            });
        }
        return this._3ds;
    };
    BraintreeSDKCreator.prototype.getDataCollector = function () {
        if (!this._dataCollector) {
            this._dataCollector = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadDataCollector(),
            ])
                .then(function (_a) {
                var client = _a[0], dataCollector = _a[1];
                return dataCollector.create({ client: client, kount: true });
            })
                .catch(function (error) {
                if (error && error.code === 'DATA_COLLECTOR_KOUNT_NOT_ENABLED') {
                    return { deviceData: undefined, teardown: function () { return Promise.resolve(); } };
                }
                throw error;
            });
        }
        return this._dataCollector;
    };
    BraintreeSDKCreator.prototype.teardown = function () {
        var _this = this;
        return Promise.all([
            this._teardown(this._3ds),
            this._teardown(this._dataCollector),
        ]).then(function () {
            _this._3ds = undefined;
            _this._dataCollector = undefined;
        });
    };
    BraintreeSDKCreator.prototype._teardown = function (module) {
        return module ?
            module.then(function (mod) { return mod.teardown(); }) :
            Promise.resolve();
    };
    return BraintreeSDKCreator;
}());
exports.default = BraintreeSDKCreator;
//# sourceMappingURL=braintree-sdk-creator.js.map