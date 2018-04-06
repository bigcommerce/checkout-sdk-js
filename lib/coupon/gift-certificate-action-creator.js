"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var actionTypes = require("./gift-certificate-action-types");
var GiftCertificateActionCreator = (function () {
    function GiftCertificateActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    GiftCertificateActionCreator.prototype.applyGiftCertificate = function (giftCertificate, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED));
            _this._checkoutClient.applyGiftCertificate(giftCertificate, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED, body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.APPLY_GIFT_CERTIFICATE_FAILED, response));
            });
        });
    };
    GiftCertificateActionCreator.prototype.removeGiftCertificate = function (giftCertificate, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED));
            _this._checkoutClient.removeGiftCertificate(giftCertificate, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED, body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.REMOVE_GIFT_CERTIFICATE_FAILED, response));
            });
        });
    };
    return GiftCertificateActionCreator;
}());
exports.default = GiftCertificateActionCreator;
//# sourceMappingURL=gift-certificate-action-creator.js.map