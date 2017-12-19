"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gift_certificate_mock_1 = require("./gift-certificate.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var giftCertificateActionTypes = require("../coupon/gift-certificate-action-types");
var gift_certificate_reducer_1 = require("./gift-certificate-reducer");
describe('giftCertificateReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {};
    });
    it('no data gets stored when a gift certificate is applied', function () {
        var response = gift_certificate_mock_1.getGiftCertificateResponseBody();
        var action = {
            type: giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(gift_certificate_reducer_1.default(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });
    it('no data gets stored when a gift certificate is removed', function () {
        var response = gift_certificate_mock_1.getGiftCertificateResponseBody();
        var action = {
            type: giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(gift_certificate_reducer_1.default(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });
    it('returns an error state if gift certificate failed to be applied', function () {
        var action = {
            type: giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(gift_certificate_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyGiftCertificateError: errors_mock_1.getErrorResponseBody() },
            statuses: { isApplyingGiftCertificate: false },
        }));
    });
    it('returns an error state if gift certificate failed to be removed', function () {
        var action = {
            type: giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(gift_certificate_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { removeGiftCertificateError: errors_mock_1.getErrorResponseBody() },
            statuses: { isRemovingGiftCertificate: false },
        }));
    });
    it('returns new state while applying a gift certificate', function () {
        var action = {
            type: giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED,
        };
        expect(gift_certificate_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplyingGiftCertificate: true },
        }));
    });
    it('returns new state while removing a giftCertificate', function () {
        var action = {
            type: giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED,
        };
        expect(gift_certificate_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isRemovingGiftCertificate: true },
        }));
    });
});
//# sourceMappingURL=gift-certificate-reducer.spec.js.map