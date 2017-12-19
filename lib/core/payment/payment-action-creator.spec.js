"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var payments_mock_1 = require("./payments.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./payment-action-types");
var payment_action_creator_1 = require("./payment-action-creator");
describe('PaymentActionCreator', function () {
    var paymentActionCreator;
    var paymentRequestSender;
    beforeEach(function () {
        paymentRequestSender = {
            submitPayment: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(payments_mock_1.getPaymentResponseBody())); }),
        };
        paymentActionCreator = new payment_action_creator_1.default(paymentRequestSender);
    });
    describe('#submitPayment()', function () {
        it('dispatches actions to data store', function () {
            paymentActionCreator.submitPayment(payments_mock_1.getPayment())
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    {
                        type: actionTypes.SUBMIT_PAYMENT_REQUESTED,
                    },
                    {
                        type: actionTypes.SUBMIT_PAYMENT_SUCCEEDED,
                        payload: payments_mock_1.getPaymentResponseBody(),
                    },
                ]);
            });
        });
        it('dispatches error actions to data store if unsuccessful', function () {
            jest.spyOn(paymentRequestSender, 'submitPayment').mockReturnValue(Promise.reject(responses_mock_1.getResponse(payments_mock_1.getErrorPaymentResponseBody())));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            paymentActionCreator.submitPayment(payments_mock_1.getPayment())
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    {
                        type: actionTypes.SUBMIT_PAYMENT_REQUESTED,
                    },
                    {
                        type: actionTypes.SUBMIT_PAYMENT_FAILED,
                        payload: responses_mock_1.getResponse(payments_mock_1.getErrorPaymentResponseBody()),
                        error: true,
                    },
                ]);
            });
        });
    });
});
//# sourceMappingURL=payment-action-creator.spec.js.map