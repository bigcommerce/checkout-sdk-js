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

    describe('#initializeCustomer()', () => {
        it('calls initializer and notifies progress', async () => {
            const initializer = jest.fn(() => Promise.resolve(true));
            const actions = await customerActionCreator.initializeCustomer('foobar', initializer)
                .toArray()
                .toPromise();

            expect(initializer).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: actionTypes.INITIALIZE_CUSTOMER_REQUESTED, meta: { methodId: 'foobar' } },
                { type: actionTypes.INITIALIZE_CUSTOMER_SUCCEEDED, payload: true, meta: { methodId: 'foobar' } },
            ]);
        });

        it('emits error if initializer fails to complete', async () => {
            const initializer = jest.fn(() => Promise.reject(false));

            try {
                const actions = await customerActionCreator.initializeCustomer('foobar', initializer)
                    .toArray()
                    .toPromise();

                expect(actions).toEqual([
                    { type: actionTypes.INITIALIZE_CUSTOMER_REQUESTED, meta: { methodId: 'foobar' } },
                ]);
            } catch (error) {
                expect(error).toEqual(
                    { type: actionTypes.INITIALIZE_CUSTOMER_FAILED, error: true, payload: false, meta: { methodId: 'foobar' } }
                );
            }
        });
    });
});
