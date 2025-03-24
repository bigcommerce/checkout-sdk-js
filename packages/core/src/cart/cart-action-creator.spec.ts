import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { Cart } from '../cart';
import CheckoutStore from '../checkout/checkout-store';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import createCheckoutStore from '../checkout/create-checkout-store';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import CartActionCreator from './cart-action-creator';
import { CartActionType } from './cart-actions';
import CartRequestSender from './cart-request-sender';
import { getCart } from './carts.mock';

describe('CartActionCreator', () => {
    let cartActionCreator: CartActionCreator;
    let requestSender: RequestSender;
    let cartRequestSender: CartRequestSender;
    let store: CheckoutStore;
    let cart: Cart;

    beforeEach(() => {
        cart = getCart();
        requestSender = createRequestSender();

        cartRequestSender = new CartRequestSender(requestSender);

        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(cartRequestSender, 'loadCart').mockReturnValue(
            Promise.resolve(getResponse(getCart())),
        );

        cartActionCreator = new CartActionCreator(cartRequestSender);
    });

    it('emits action to notify loading progress', async () => {
        const actions = await from(cartActionCreator.loadCart(cart.id)(store))
            .pipe(toArray())
            .toPromise();

        expect(cartRequestSender.loadCart).toHaveBeenCalledWith(cart.id, undefined);

        expect(actions).toEqual(
            expect.arrayContaining([
                { type: CartActionType.LoadCartRequested },
                {
                    type: CartActionType.LoadCartSucceeded,
                    payload: getCart(),
                },
            ]),
        );
    });

    it('emits error action if unable to load cart', async () => {
        jest.spyOn(cartRequestSender, 'loadCart').mockReturnValue(
            Promise.reject(getErrorResponse()),
        );

        const errorHandler = jest.fn((action) => of(action));

        const actions = await from(cartActionCreator.loadCart(cart.id)(store))
            .pipe(catchError(errorHandler), toArray())
            .toPromise();

        expect(cartRequestSender.loadCart).toHaveBeenCalledWith(cart.id, undefined);

        expect(actions).toEqual(
            expect.arrayContaining([
                { type: CartActionType.LoadCartRequested },
                {
                    type: CartActionType.LoadCartFailed,
                    error: true,
                    payload: getErrorResponse(),
                },
            ]),
        );
    });
});
