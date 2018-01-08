"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./gift-certificate-action-types");
var GiftCertificateActionCreator = (function () {
    function GiftCertificateActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    GiftCertificateActionCreator.prototype.applyGiftCertificate = function (giftCertificate, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED));
            _this._checkoutClient.applyGiftCertificate(giftCertificate, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED, data));
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
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED, data));
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