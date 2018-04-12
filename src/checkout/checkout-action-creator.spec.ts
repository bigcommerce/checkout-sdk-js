import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';

import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs/Observable';

import { CartRequestSender } from '../cart';
import { getCart } from '../cart/carts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import CheckoutActionCreator from './checkout-action-creator';
import { CheckoutActionType } from './checkout-actions';
import { getCheckout } from './checkouts.mock';
import createCheckoutClient from './create-checkout-client';

describe('CheckoutActionCreator', () => {
    let checkoutClient;
    let cartRequestSender;

    beforeEach(() => {
        checkoutClient = createCheckoutClient();
        cartRequestSender = new CartRequestSender(createRequestSender());

        jest.spyOn(cartRequestSender, 'loadCarts')
            .mockReturnValue(Promise.resolve(getResponse([getCart()])));

        jest.spyOn(checkoutClient, 'loadCheckout')
            .mockReturnValue(Promise.resolve(getResponse(getCheckout())));
    });

    it('emits action to notify loading progress', async () => {
        const actionCreator = new CheckoutActionCreator(checkoutClient, cartRequestSender);
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

        const actionCreator = new CheckoutActionCreator(checkoutClient, cartRequestSender);
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
