"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_mock_1 = require("../common/error/errors.mock");
var gift_certificate_selector_1 = require("./gift-certificate-selector");
describe('GiftCertificateSelector', function () {
    var giftCertificateSelector;
    var state;
    beforeEach(function () {
        state = {};
    });
    describe('#getApplyError()', function () {
        it('returns error if unable to apply', function () {
            var applyGiftCertificateError = errors_mock_1.getErrorResponseBody();
            giftCertificateSelector = new gift_certificate_selector_1.default(tslib_1.__assign({}, state.quote, { errors: { applyGiftCertificateError: applyGiftCertificateError } }));
            expect(giftCertificateSelector.getApplyError()).toEqual(applyGiftCertificateError);
        });
        it('does not returns error if able to apply', function () {
            giftCertificateSelector = new gift_certificate_selector_1.default(state.quote);
            expect(giftCertificateSelector.getApplyError()).toBeUndefined();
        });
    });
    describe('#isApplying()', function () {
        it('returns true if applying a gift certificate', function () {
            giftCertificateSelector = new gift_certificate_selector_1.default(tslib_1.__assign({}, state.quote, { statuses: { isApplyingGiftCertificate: true } }));
            expect(giftCertificateSelector.isApplying()).toEqual(true);
        });
        it('returns false if not applying a gift certificate', function () {
            giftCertificateSelector = new gift_certificate_selector_1.default(state.quote);
            expect(giftCertificateSelector.isApplying()).toEqual(false);
        });
    });
    describe('#getRemoveError()', function () {
        it('returns error if unable to remove', function () {
            var removeGiftCertificateError = errors_mock_1.getErrorResponseBody();
            giftCertificateSelector = new gift_certificate_selector_1.default(tslib_1.__assign({}, state.quote, { errors: { removeGiftCertificateError: removeGiftCertificateError } }));
            expect(giftCertificateSelector.getRemoveError()).toEqual(removeGiftCertificateError);
        });
        it('does not returns error if able to remove', function () {
            giftCertificateSelector = new gift_certificate_selector_1.default(state.quote);
            expect(giftCertificateSelector.getRemoveError()).toBeUndefined();
        });
    });
    describe('#isRemoving()', function () {
        it('returns true if removing a gift certificate', function () {
            giftCertificateSelector = new gift_certificate_selector_1.default(tslib_1.__assign({}, state.quote, { statuses: { isRemovingGiftCertificate: true } }));
            expect(giftCertificateSelector.isRemoving()).toEqual(true);
        });
        it('returns false if not removing a gift certificate', function () {
            giftCertificateSelector = new gift_certificate_selector_1.default(state.quote);
            expect(giftCertificateSelector.isRemoving()).toEqual(false);
        });
    });
});
//# sourceMappingURL=gift-certificate-selector.spec.js.map