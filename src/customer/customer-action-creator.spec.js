import { Observable } from 'rxjs';
import { getCustomerResponseBody } from './internal-customers.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './customer-action-types';
import CustomerActionCreator from './customer-action-creator';

describe('CustomerActionCreator', () => {
    let checkoutClient;
    let customerActionCreator;
    let errorResponse;
    let response;

    beforeEach(() => {
        response = getResponse(getCustomerResponseBody());
        errorResponse = getErrorResponse();

        checkoutClient = {
            signInCustomer: jest.fn(() => Promise.resolve(response)),
            signOutCustomer: jest.fn(() => Promise.resolve(response)),
        };

        customerActionCreator = new CustomerActionCreator(checkoutClient);
    });

    describe('#signInCustomer()', () => {
        it('emits actions if able to sign in customer', () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            customerActionCreator.signInCustomer(credentials)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.SIGN_IN_CUSTOMER_REQUESTED },
                        { type: actionTypes.SIGN_IN_CUSTOMER_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to sign in customer', () => {
            checkoutClient.signInCustomer.mockReturnValue(Promise.reject(errorResponse));

            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const errorHandler = jest.fn((action) => Observable.of(action));

            customerActionCreator.signInCustomer(credentials)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.SIGN_IN_CUSTOMER_REQUESTED },
                        { type: actionTypes.SIGN_IN_CUSTOMER_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });

    describe('#signOutCustomer()', () => {
        it('emits actions if able to sign out customer', () => {
            customerActionCreator.signOutCustomer()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.SIGN_OUT_CUSTOMER_REQUESTED },
                        { type: actionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to sign out customer', () => {
            checkoutClient.signOutCustomer.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            customerActionCreator.signOutCustomer()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.SIGN_OUT_CUSTOMER_REQUESTED },
                        { type: actionTypes.SIGN_OUT_CUSTOMER_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
