import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../data-store';
import * as actionTypes from './cart-action-types';
import CartComparator from './cart-comparator';

export default class CartActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    loadCart(options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_CART_REQUESTED));

            this._checkoutClient.loadCart(options)
                .then(({ body: { data, meta } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_CART_SUCCEEDED, data, meta));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_CART_FAILED, response));
                });
        });
    }

    /**
     * @deprecated
     * @param {Cart} cart
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    verifyCart(cart, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.VERIFY_CART_REQUESTED));

            this._checkoutClient.loadCart(options)
                .then(({ body: { data } = {} }) => {
                    const comparator = new CartComparator();
                    const isValid = comparator.isEqual(cart, data.cart);

                    observer.next(createAction(actionTypes.VERIFY_CART_SUCCEEDED, isValid));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.VERIFY_CART_FAILED, response));
                });
        });
    }

    /**
     * @deprecated
     * This method only exists for the purpose of refactoring. We can remove this
     * once we remove CartService#setCart.
     * @param {Cart} cart
     * @return {Action}
     */
    updateCart(cart) {
        return createAction(actionTypes.CART_UPDATED, cart);
    }
}
