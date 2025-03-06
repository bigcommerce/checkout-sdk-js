import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { InternalCheckoutSelectors } from '../checkout';
import { cachableAction } from '../common/data-store';
import ActionOptions from '../common/data-store/action-options';

import { CartActionType, LoadCartAction } from './cart-actions';
import CartRequestSender from './cart-request-sender';

export default class CartActionCreator {
    constructor(private _cartRequestSender: CartRequestSender) {}

    @cachableAction
    loadCard(
        cartId: string,
        options?: RequestOptions & ActionOptions,
    ): ThunkAction<LoadCartAction, InternalCheckoutSelectors> {
        return (store) => {
            return Observable.create((observer: Observer<LoadCartAction>) => {
                const state = store.getState();
                const host = state.config.getHost();

                observer.next(createAction(CartActionType.LoadCartRequested, undefined));

                this._cartRequestSender
                    .loadCard(cartId, host, options)
                    .then((response) => {
                        observer.next(
                            createAction(CartActionType.LoadCartSucceeded, response.body),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(createErrorAction(CartActionType.LoadCartFailed, response));
                    });
            });
        };
    }
}
