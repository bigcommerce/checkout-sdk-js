"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var paymentStatusTypes = require("../payment-status-types");
var payment_strategy_1 = require("./payment-strategy");
var SagePayPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(SagePayPaymentStrategy, _super);
    /**
     * @constructor
     * @param {ReadableDataStore} store
     * @param {PlaceOrderService} placeOrderService
     * @param {FormPoster} formPoster
     */
    function SagePayPaymentStrategy(store, placeOrderService, formPoster) {
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._formPoster = formPoster;
        return _this;
    }
    /**
     * @inheritdoc
     */
    SagePayPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        return this._placeOrderService.submitOrder(lodash_1.omit(payload, 'payment'), options)
            .then(function () {
            return _this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options);
        })
            .catch(function (state) {
            var body = state.errors.getSubmitOrderError().body;
            if (!lodash_1.some(body.errors, { code: 'three_d_secure_required' })) {
                return Promise.reject(state);
            }
            return new Promise(function () {
                _this._formPoster.postForm(body.three_ds_result.acs_url, {
                    PaReq: body.three_ds_result.payer_auth_request,
                    TermUrl: body.three_ds_result.callback_url,
                    MD: body.three_ds_result.merchant_data,
                });
            });
        });
    };
    /**
     * @inheritdoc
     */
    SagePayPaymentStrategy.prototype.finalize = function (options) {
        var checkout = this._store.getState().checkout;
        var _a = checkout.getOrder(), orderId = _a.orderId, _b = _a.payment, payment = _b === void 0 ? {} : _b;
        if (orderId && payment.status === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }
        return Promise.resolve(this._store.getState());
    };
    return SagePayPaymentStrategy;
}(payment_strategy_1.default));
exports.default = SagePayPaymentStrategy;
//# sourceMappingURL=sage-pay-payment-strategy.js.map