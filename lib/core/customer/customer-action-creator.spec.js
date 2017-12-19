"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var customers_mock_1 = require("./customers.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./customer-action-types");
var customer_action_creator_1 = require("./customer-action-creator");
describe('CustomerActionCreator', function () {
    var checkoutClient;
    var customerActionCreator;
    var errorResponse;
    var response;
    beforeEach(function () {
        response = responses_mock_1.getResponse(customers_mock_1.getCustomerResponseBody());
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            signInCustomer: jest.fn(function () { return Promise.resolve(response); }),
            signOutCustomer: jest.fn(function () { return Promise.resolve(response); }),
        };
        customerActionCreator = new customer_action_creator_1.default(checkoutClient);
    });
    describe('#signInCustomer()', function () {
        it('emits actions if able to sign in customer', function () {
            var credentials = { email: 'foo@bar.com', password: 'foobar' };
            customerActionCreator.signInCustomer(credentials)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.SIGN_IN_CUSTOMER_REQUESTED },
                    { type: actionTypes.SIGN_IN_CUSTOMER_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to sign in customer', function () {
            checkoutClient.signInCustomer.mockReturnValue(Promise.reject(errorResponse));
            var credentials = { email: 'foo@bar.com', password: 'foobar' };
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            customerActionCreator.signInCustomer(credentials)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.SIGN_IN_CUSTOMER_REQUESTED },
                    { type: actionTypes.SIGN_IN_CUSTOMER_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
    describe('#signOutCustomer()', function () {
        it('emits actions if able to sign out customer', function () {
            customerActionCreator.signOutCustomer()
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.SIGN_OUT_CUSTOMER_REQUESTED },
                    { type: actionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to sign out customer', function () {
            checkoutClient.signOutCustomer.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            customerActionCreator.signOutCustomer()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.SIGN_OUT_CUSTOMER_REQUESTED },
                    { type: actionTypes.SIGN_OUT_CUSTOMER_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=customer-action-creator.spec.js.map