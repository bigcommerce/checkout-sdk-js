import { createAction, createErrorAction, ReadableDataStore, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Address } from '../address';
import { CheckoutClient, CheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { ConsignmentsRequestBody } from './consignment';
import { ConsignmentActionTypes, CreateConsignmentsAction } from './consignment-actions';

export default class ConsignmentActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    updateAddress(address: Address, options?: RequestOptions): ThunkAction<CreateConsignmentsAction, CheckoutSelectors> {
        return store => Observable.create((observer: Observer<CreateConsignmentsAction>) => {
            const consignments = this._getConsignmentsRequestBody(address, store);
            const checkout = store.getState().checkout.getCheckout();

            if (!consignments || !checkout) {
                throw new MissingDataError('Unable to update shipping address: "checkoutId" or "lineItems" are missing.');
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
