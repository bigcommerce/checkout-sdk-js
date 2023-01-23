import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender } from '../checkout';
import { getCheckoutWithBuyNowCart } from '../checkout/checkouts.mock';
import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';

import { getBuyNowCart, getBuyNowCartRequestBody } from './carts.mock';
import { Cart, CartActionCreator, CartActionType, CartRequestSender } from './index';

describe('CartActionCreator', () => {
    let cartActionCreator: CartActionCreator;
    let cartRequestSender: CartRequestSender;
    let checkoutActionCreator: CheckoutActionCreator;
    let errorResponse: Response<ErrorResponseBody>;
    let response: Response<Cart>;

    beforeEach(() => {
        const requestSender = createRequestSender();

        response = getResponse(getBuyNowCart());
        errorResponse = getErrorResponse();

        cartRequestSender = new CartRequestSender(requestSender);

        jest.spyOn(cartRequestSender, 'createBuyNowCart').mockReturnValue(
            Promise.resolve(response),
        );

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        jest.spyOn(checkoutActionCreator, 'loadCheckout').mockReturnValue(
            from([
                createAction(CheckoutActionType.LoadCheckoutRequested),
                createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckoutWithBuyNowCart()),
            ]),
        );

        cartActionCreator = new CartActionCreator(cartRequestSender, checkoutActionCreator);
    });

    describe('#createBuyNowCart', () => {
        it('emits actions if able to create buy now cart', async () => {
            const actions = await from(
                cartActionCreator.createBuyNowCart(getBuyNowCartRequestBody()),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CartActionType.CreateBuyNowCartRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                {
                    type: CheckoutActionType.LoadCheckoutSucceeded,
                    payload: getCheckoutWithBuyNowCart(),
                },
                { type: CartActionType.CreateBuyNowCartSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to create buy now cart', async () => {
            jest.spyOn(cartRequestSender, 'createBuyNowCart').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(
                cartActionCreator.createBuyNowCart(getBuyNowCartRequestBody()),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CartActionType.CreateBuyNowCartRequested },
                {
                    type: CartActionType.CreateBuyNowCartFailed,
                    payload: errorResponse,
                    error: true,
                },
            ]);
        });

        it('emits actions to load checkout by buy now cart id', async () => {
            await from(cartActionCreator.createBuyNowCart(getBuyNowCartRequestBody())).toPromise();

            expect(checkoutActionCreator.loadCheckout).toHaveBeenCalledWith(getBuyNowCart().id);
        });
    });
});
