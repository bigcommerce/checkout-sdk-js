"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var http_request_1 = require("../../http-request");
var payment_methods_mock_1 = require("./payment-methods.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./payment-method-action-types");
var payment_method_action_creator_1 = require("./payment-method-action-creator");
describe('PaymentMethodActionCreator', function () {
    var checkoutClient;
    var errorResponse;
    var paymentMethodActionCreator;
    var paymentMethodResponse;
    var paymentMethodsResponse;
    beforeEach(function () {
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        paymentMethodResponse = responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethodResponseBody());
        paymentMethodsResponse = responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethodsResponseBody());
        checkoutClient = {
            loadPaymentMethod: jest.fn(function () { return Promise.resolve(paymentMethodResponse); }),
            loadPaymentMethods: jest.fn(function () { return Promise.resolve(paymentMethodsResponse); }),
        };
        paymentMethodActionCreator = new payment_method_action_creator_1.default(checkoutClient);
    });
    describe('#loadPaymentMethods()', function () {
        it('sends a request to get a list of payment methods', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, paymentMethodActionCreator.loadPaymentMethods().toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadPaymentMethods).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('emits actions if able to load payment methods', function () {
            paymentMethodActionCreator.loadPaymentMethods()
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_PAYMENT_METHODS_REQUESTED },
                    { type: actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED, payload: paymentMethodsResponse.body.data },
                ]);
            });
        });
        it('emits error actions if unable to load payment methods', function () {
            checkoutClient.loadPaymentMethods.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            paymentMethodActionCreator.loadPaymentMethods()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_PAYMENT_METHODS_REQUESTED },
                    { type: actionTypes.LOAD_PAYMENT_METHODS_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
    describe('#loadPaymentMethod()', function () {
        it('loads payment method data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var methodId;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        methodId = 'braintree';
                        return [4 /*yield*/, paymentMethodActionCreator.loadPaymentMethod(methodId).toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith(methodId, undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads payment method data with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var methodId, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        methodId = 'braintree';
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, paymentMethodActionCreator.loadPaymentMethod(methodId, options).toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith(methodId, options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('emits actions if able to load payment method', function () {
            var methodId = 'braintree';
            paymentMethodActionCreator.loadPaymentMethod(methodId)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, meta: { methodId: methodId } },
                    { type: actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED, meta: { methodId: methodId }, payload: paymentMethodResponse.body.data },
                ]);
            });
        });
        it('emits error actions if unable to load payment method', function () {
            checkoutClient.loadPaymentMethod.mockReturnValue(Promise.reject(errorResponse));
            var methodId = 'braintree';
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            paymentMethodActionCreator.loadPaymentMethod(methodId)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, meta: { methodId: methodId } },
                    { type: actionTypes.LOAD_PAYMENT_METHOD_FAILED, meta: { methodId: methodId }, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=payment-method-action-creator.spec.js.map