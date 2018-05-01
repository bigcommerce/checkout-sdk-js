import { createAction, createErrorAction, ReadableDataStore, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Address } from '../address';
import { CheckoutAction, CheckoutActionType, CheckoutClient, CheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { ConsignmentsRequestBody } from './consignment';
import { ConsignmentActionTypes, CreateConsignmentsAction, UpdateConsignmentAction } from './consignment-actions';

export default class ConsignmentActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    selectShippingOption(id: string, options?: RequestOptions): ThunkAction<UpdateConsignmentAction, CheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateConsignmentAction>) => {
            const checkoutSelector = store.getState().checkout;
            const checkout = checkoutSelector.getCheckout();
            const address = checkoutSelector.getShippingAddress();

            if (!checkout || !checkout.id || !address || !address.id ) {
                throw new MissingDataError('Unable to update shipping address: "checkout.id" or "shippingAddress.id" is missing.');
            }

            observer.next(createAction(ConsignmentActionTypes.UpdateConsignmentRequested));

            const consignmentUpdateBody = {
                id: address.id,
                shippingOptionId: id,
            };

            this._checkoutClient.updateConsignment(checkout.id, consignmentUpdateBody, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(ConsignmentActionTypes.UpdateConsignmentSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionTypes.UpdateConsignmentFailed, response));
                });
        });
    }

    loadShippingOptions(options?: RequestOptions): ThunkAction<CheckoutAction, CheckoutSelectors> {
        return store => Observable.create((observer: Observer<CheckoutAction>) => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout || !checkout.id) {
                throw new MissingDataError('Unable to load shipping options: "checkout.id" is missing.');
            }

            observer.next(createAction(CheckoutActionType.LoadCheckoutRequested));

            this._checkoutClient.loadCheckout(checkout.id, {
                ...options,
                params: {
                    include: ['consignments.availableShippingOptions'],
                },
            })
            .then(({ body }) => {
                observer.next(createAction(CheckoutActionType.LoadCheckoutSucceeded, body));
                observer.complete();
            })
            .catch(response => {
                observer.error(createErrorAction(CheckoutActionType.LoadCheckoutFailed, response));
            });
        });
    }

    updateAddress(address: Address, options?: RequestOptions): ThunkAction<CreateConsignmentsAction, CheckoutSelectors> {
        return store => Observable.create((observer: Observer<CreateConsignmentsAction>) => {
            const consignments = this._getConsignmentsRequestBody(address, store);
            const checkout = store.getState().checkout.getCheckout();

            if (!consignments || !checkout || !checkout.id) {
                throw new MissingDataError('Unable to update shipping address: "checkout.id" or "cart.lineItems" are missing.');
            }

            observer.next(createAction(ConsignmentActionTypes.CreateConsignmentsRequested));

            this._checkoutClient.createConsignments(checkout.id, consignments, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(ConsignmentActionTypes.CreateConsignmentsSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionTypes.CreateConsignmentsFailed, response));
                });
        });
    }

    private _getConsignmentsRequestBody(
        shippingAddress: Address,
        store: ReadableDataStore<CheckoutSelectors>
    ): ConsignmentsRequestBody | undefined {
        const { checkout: { getCart } } = store.getState();
        const cart = getCart();

        if (!cart || !cart.items) {
            return;
        }

        return [{
            shippingAddress,
            lineItems: cart.items.map(item => ({
                itemId: item.id,
                quantity: item.quantity,
            })),
        }];
    }
}
