"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var payments_mock_1 = require("./payments.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var actionTypes = require("./payment-action-types");
var payment_reducer_1 = require("./payment-reducer");
describe('paymentReducer', function () {
    var initialState;
    beforeEach(function () {
        initialState = {};
    });
    it('returns new data while submitting payment', function () {
        var action = {
            type: actionTypes.SUBMIT_PAYMENT_REQUESTED,
        };
        expect(payment_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isSubmitting: true },
        }));
    });
    it('returns new data if payment is submitted successfully', function () {
        var action = {
            type: actionTypes.SUBMIT_PAYMENT_SUCCEEDED,
            payload: payments_mock_1.getPaymentResponseBody(),
        };
        expect(payment_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload,
            statuses: { isSubmitting: false },
        }));
    });
    it('returns new data if payment is not submitted successfully', function () {
        var action = {
            type: actionTypes.SUBMIT_PAYMENT_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
            error: true,
        };
        expect(payment_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { submitError: action.payload },
            statuses: { isSubmitting: false },
        }));
    });
});
//# sourceMappingURL=payment-reducer.spec.js.map