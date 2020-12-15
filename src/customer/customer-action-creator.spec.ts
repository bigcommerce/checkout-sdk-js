import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';

import CustomerActionCreator from './customer-action-creator';
import { CustomerActionType } from './customer-actions';
import CustomerRequestSender from './customer-request-sender';
import { InternalCustomerResponseBody } from './internal-customer-responses';
import { getCustomerResponseBody } from './internal-customers.mock';

describe('CustomerActionCreator', () => {
    let customerRequestSender: CustomerRequestSender;
    let checkoutActionCreator: CheckoutActionCreator;
    let customerActionCreator: CustomerActionCreator;
    let errorResponse: Response<ErrorResponseBody>;
    let response: Response<InternalCustomerResponseBody>;
    let store: CheckoutStore;

    beforeEach(() => {
        response = getResponse(getCustomerResponseBody());
        errorResponse = getErrorResponse();
        store = createCheckoutStore();

        customerRequestSender = new CustomerRequestSender(createRequestSender());

        jest.spyOn(customerRequestSender, 'createAccount').mockReturnValue(Promise.resolve({}));
        jest.spyOn(customerRequestSender, 'signInCustomer').mockReturnValue(Promise.resolve(response));
        jest.spyOn(customerRequestSender, 'signOutCustomer').mockReturnValue(Promise.resolve(response));

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(createRequestSender()),
            new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
            new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
        );

        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout')
            .mockReturnValue(() => from([
                createAction(CheckoutActionType.LoadCheckoutRequested),
                createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
            ]));

        customerActionCreator = new CustomerActionCreator(
            customerRequestSender,
            checkoutActionCreator
        );
    });

    describe('#createAccount()', () => {
        it('emits actions if able to create customer', async () => {
            const customer = {
                email: 'foo@bar.com',
                password: 'foobar',
                firstName: 'first',
                lastName: 'last',
            };

            const actions = await from(customerActionCreator.createAccount(customer)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.CreateCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.CreateCustomerSucceeded },
            ]);
        });

        it('emits error actions if unable to create customer', async () => {
            jest.spyOn(customerRequestSender, 'createAccount').mockReturnValue(Promise.reject(errorResponse));

            const customer = {
                email: 'foo@bar.com',
                password: 'foobar',
                firstName: 'first',
                lastName: 'last',
            };

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(customerActionCreator.createAccount(customer)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.CreateCustomerRequested },
                { type: CustomerActionType.CreateCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('emits actions to reload current checkout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            await from(customerActionCreator.signInCustomer(credentials)(store))
                .toPromise();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
        });
    });

    describe('#signInCustomer()', () => {
        it('emits actions if able to sign in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const actions = await from(customerActionCreator.signInCustomer(credentials)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.SignInCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.SignInCustomerSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to sign in customer', async () => {
            jest.spyOn(customerRequestSender, 'signInCustomer').mockReturnValue(Promise.reject(errorResponse));

            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const errorHandler = jest.fn(action => of(action));
            const actions = await from(customerActionCreator.signInCustomer(credentials)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.SignInCustomerRequested },
                { type: CustomerActionType.SignInCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('emits actions to reload current checkout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            await from(customerActionCreator.signInCustomer(credentials)(store))
                .toPromise();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
        });
    });

    describe('#signOutCustomer()', () => {
        it('emits actions if able to sign out customer', async () => {
            const actions = await from(customerActionCreator.signOutCustomer()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.SignOutCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.SignOutCustomerSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to sign out customer', async () => {
            jest.spyOn(customerRequestSender, 'signOutCustomer').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(customerActionCreator.signOutCustomer()(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.SignOutCustomerRequested },
                { type: CustomerActionType.SignOutCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('emits actions to reload current checkout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            await from(customerActionCreator.signInCustomer(credentials)(store))
                .toPromise();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
        });
    });
});
