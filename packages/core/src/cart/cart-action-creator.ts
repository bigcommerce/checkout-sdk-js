import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Response } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { Observable, Observer } from 'rxjs';

import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { InternalCheckoutSelectors } from '../checkout';
import { cachableAction } from '../common/data-store';
import ActionOptions from '../common/data-store/action-options';

import Cart from './cart';
import { CartActionType, LoadCartAction } from './cart-actions';
import CartRequestSender from './cart-request-sender';
import { GQLCartResponse, GQLCurrencyResponse, GQLRequestResponse, mapToCart } from './gql-cart';

export default class CartActionCreator {
    constructor(private _cartRequestSender: CartRequestSender) {}

    @cachableAction
    loadCart(
        cartId: string,
        options?: RequestOptions & ActionOptions,
    ): ThunkAction<LoadCartAction, InternalCheckoutSelectors> {
        return (store) => {
            return new Observable((observer: Observer<LoadCartAction>) => {
                const state = store.getState();
                const gqlUrl = state.config.getGQLRequestUrl();

                observer.next(createAction(CartActionType.LoadCartRequested, undefined));

                this._cartRequestSender
                    .loadCart(cartId, gqlUrl, options)
                    .then((cartResponse) => {
                        return this._cartRequestSender
                            .loadCartCurrency(
                                cartResponse.body.data.site.cart.currencyCode,
                                gqlUrl,
                                options,
                            )
                            .then((currencyResponse) => {
                                observer.next(
                                    createAction(
                                        CartActionType.LoadCartSucceeded,
                                        this.transformToCartResponse(
                                            merge(cartResponse, currencyResponse),
                                        ),
                                    ),
                                );
                                observer.complete();
                            });
                    })
                    .catch((response) => {
                        observer.error(createErrorAction(CartActionType.LoadCartFailed, response));
                    });
            });
        };
    }

    private transformToCartResponse(
        response: Response<GQLRequestResponse<GQLCartResponse & GQLCurrencyResponse>>,
    ): Cart {
        const {
            body: {
                data: { site },
            },
        } = response;

        return mapToCart(site);
    }
}
