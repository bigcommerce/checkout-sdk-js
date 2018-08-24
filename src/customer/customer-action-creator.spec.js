import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';

import { getCustomerResponseBody } from './internal-customers.mock';
import CustomerActionCreator from './customer-action-creator';
import { CustomerActionType } from './customer-actions';

describe('CustomerActionCreator', () => {
    let checkoutActionCreator;
    let customerActionCreator;
    let customerRequestSender;
    let errorResponse;
    let response;
    let store;

    beforeEach(() => {
        response = getResponse(getCustomerResponseBody());
        errorResponse = getErrorResponse();
        store = createCheckoutStore();

        customerRequestSender = {
            signInCustomer: jest.fn(() => Promise.resolve(response)),
            signOutCustomer: jest.fn(() => Promise.resolve(response)),
        };

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(createRequestSender())
        );

        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout')
            .mockReturnValue(() => Observable.from([
                createAction(CheckoutActionType.LoadCheckoutRequested),
                createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
            ]));

        customerActionCreator = new CustomerActionCreator(
            customerRequestSender,
            checkoutActionCreator
        );
    });

    describe('#signInCustomer()', () => {
        it('emits actions if able to sign in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const actions = await customerActionCreator.signInCustomer(credentials)(store)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.SignInCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.SignInCustomerSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to sign in customer', async () => {
            customerRequestSender.signInCustomer.mockReturnValue(Promise.reject(errorResponse));

            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await customerActionCreator.signInCustomer(credentials)(store)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.SignInCustomerRequested },
                { type: CustomerActionType.SignInCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('emits actions to reload current checkout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            await customerActionCreator.signInCustomer(credentials)(store)
                .toPromise();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
        });
    });

    describe('#signOutCustomer()', () => {
        it('emits actions if able to sign out customer', async () => {
            const actions = await customerActionCreator.signOutCustomer()(store)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.SignOutCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.SignOutCustomerSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to sign out customer', async () => {
            customerRequestSender.signOutCustomer.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await customerActionCreator.signOutCustomer()(store)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.SignOutCustomerRequested },
                { type: CustomerActionType.SignOutCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('emits actions to reload current checkout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            await customerActionCreator.signInCustomer(credentials)(store)
                .toPromise();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
        });
    });
});
