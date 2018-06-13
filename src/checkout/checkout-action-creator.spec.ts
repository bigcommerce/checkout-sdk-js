import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';
import { from } from 'rxjs/observable/from';

import { MissingDataError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import CheckoutActionCreator from './checkout-action-creator';
import { CheckoutActionType } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';
import CheckoutStore from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import { getCheckout, getCheckoutState } from './checkouts.mock';
import createCheckoutStore from './create-checkout-store';

describe('CheckoutActionCreator', () => {
    let actionCreator: CheckoutActionCreator;
    let checkoutRequestSender: CheckoutRequestSender;
    let store: CheckoutStore;

    beforeEach(() => {
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        store = createCheckoutStore({
            checkout: getCheckoutState(),
        });

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

    describe('#loadCurrentCheckout()', () => {
        it('loads checkout by using existing id', async () => {
            await from(actionCreator.loadCurrentCheckout()(store))
                .toPromise();

            expect(checkoutRequestSender.loadCheckout)
                .toHaveBeenCalledWith('b20deef40f9699e48671bbc3fef6ca44dc80e3c7', undefined);
        });

        it('throws error if there is no existing checkout id', async () => {
            store = createCheckoutStore();

            try {
                await from(actionCreator.loadCurrentCheckout()(store))
                    .toPromise();
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads checkout only when action is dispatched', async () => {
            const action = actionCreator.loadCurrentCheckout()(store);

            expect(checkoutRequestSender.loadCheckout).not.toHaveBeenCalled();

            await store.dispatch(action);

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalled();
        });
    });
});
