import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Observable';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { createCheckoutStore } from '.';
import CheckoutActionCreator from './checkout-action-creator';
import { CheckoutActionType } from './checkout-actions';
import { getCheckout, getCheckoutState } from './checkouts.mock';
import createCheckoutClient from './create-checkout-client';

describe('CheckoutActionCreator', () => {
    let checkoutClient;
    let actionCreator;

    beforeEach(() => {
        checkoutClient = createCheckoutClient();

        jest.spyOn(checkoutClient, 'loadCheckout')
            .mockReturnValue(Promise.resolve(getResponse(getCheckout())));

        actionCreator = new CheckoutActionCreator(checkoutClient);
    });

    describe('#loadCheckout', () => {
        it('emits action to notify loading progress', async () => {
            const { id } = getCheckout();
            const actions = await actionCreator.loadCheckout(id)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
            ]);
        });

        it('emits error action if unable to load checkout', async () => {
            jest.spyOn(checkoutClient, 'loadCheckout')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const { id } = getCheckout();
            const errorHandler = jest.fn(action => Observable.of(action));

            const actions = await actionCreator.loadCheckout(id)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutFailed, error: true, payload: getErrorResponse() },
            ]);
        });
    });
});
