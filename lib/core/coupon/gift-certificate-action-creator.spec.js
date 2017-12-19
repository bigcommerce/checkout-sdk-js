"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var gift_certificate_mock_1 = require("./gift-certificate.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./gift-certificate-action-types");
var create_checkout_store_1 = require("../create-checkout-store");
var gift_certificate_action_creator_1 = require("./gift-certificate-action-creator");
describe('GiftCertificateActionCreator', function () {
    var checkoutClient;
    var errorResponse;
    var giftCertificateActionCreator;
    var response;
    var store;
    beforeEach(function () {
        response = responses_mock_1.getResponse(gift_certificate_mock_1.getGiftCertificateResponseBody());
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        store = create_checkout_store_1.default();
        checkoutClient = {
            applyGiftCertificate: jest.fn(function () { return Promise.resolve(response); }),
            removeGiftCertificate: jest.fn(function () { return Promise.resolve(response); }),
        };
        giftCertificateActionCreator = new gift_certificate_action_creator_1.default(checkoutClient);
    });
    describe('#applyGiftCertificate()', function () {
        beforeEach(function () {
            jest.spyOn(store, 'dispatch');
        });
        it('emits actions if able to apply giftCertificate', function () {
            var giftCertificate = 'myGiftCertificate1234';
            giftCertificateActionCreator.applyGiftCertificate(giftCertificate)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED },
                    { type: actionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to apply giftCertificate', function () {
            checkoutClient.applyGiftCertificate.mockReturnValue(Promise.reject(errorResponse));
            var giftCertificate = 'myGiftCertificate1234';
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            giftCertificateActionCreator.applyGiftCertificate(giftCertificate)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED },
                    { type: actionTypes.APPLY_GIFT_CERTIFICATE_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
    describe('#removeGiftCertificate()', function () {
        beforeEach(function () {
            jest.spyOn(store, 'dispatch');
        });
        it('emits actions if able to remove giftCertificate', function () {
            var giftCertificate = 'myGiftCertificate1234';
            giftCertificateActionCreator.removeGiftCertificate(giftCertificate)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED },
                    { type: actionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to remove giftCertificate', function () {
            checkoutClient.removeGiftCertificate.mockReturnValue(Promise.reject(errorResponse));
            var giftCertificate = 'myGiftCertificate1234';
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            giftCertificateActionCreator.removeGiftCertificate(giftCertificate)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED },
                    { type: actionTypes.REMOVE_GIFT_CERTIFICATE_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=gift-certificate-action-creator.spec.js.map