import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import CheckoutActionCreator from './checkout-action-creator';
import { CheckoutActionType } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';
import { getCheckout } from './checkouts.mock';

describe('CheckoutActionCreator', () => {
    let actionCreator: CheckoutActionCreator;
    let checkoutRequestSender: CheckoutRequestSender;

    beforeEach(() => {
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());

        jest.spyOn(checkoutRequestSender, 'loadCheckout')
            .mockReturnValue(Promise.resolve(getResponse(getCheckout())));

        actionCreator = new CheckoutActionCreator(checkoutRequestSender);
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
            jest.spyOn(checkoutRequestSender, 'loadCheckout')
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
