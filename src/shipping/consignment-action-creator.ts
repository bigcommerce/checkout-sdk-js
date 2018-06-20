import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Address } from '../address';
import { CheckoutAction, CheckoutActionType, CheckoutClient, InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import CheckoutRequestSender from '../checkout/checkout-request-sender';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { ConsignmentRequestBody } from './consignment';
import { ConsignmentActionTypes, CreateConsignmentsAction, UpdateConsignmentAction } from './consignment-actions';

export default class ConsignmentActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient,
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    selectShippingOption(id: string, options?: RequestOptions): ThunkAction<UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateConsignmentAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();
            const address = state.shippingAddress.getShippingAddress();

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

    loadShippingOptions(options?: RequestOptions): ThunkAction<CheckoutAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CheckoutAction>) => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout || !checkout.id) {
                throw new MissingDataError('Unable to load shipping options: "checkout.id" is missing.');
            }

            observer.next(createAction(CheckoutActionType.LoadCheckoutRequested));

            this._checkoutRequestSender.loadCheckout(checkout.id, {
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

    updateAddress(address: Address, options?: RequestOptions): ThunkAction<CreateConsignmentsAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CreateConsignmentsAction>) => {
            const consignment = this._getConsignmentRequestBody(address, store);
            const checkout = store.getState().checkout.getCheckout();

            if (!consignment || !checkout || !checkout.id) {
                throw new MissingDataError('Unable to update shipping address: "checkout.id" or "cart.lineItems" are missing.');
            }

            const { consignments } = checkout;

            if (consignments && consignments.length) {
                consignment.id = consignments[0].id;
            }

            observer.next(createAction(ConsignmentActionTypes.CreateConsignmentsRequested));

            this._createOrUpdateConsignment(checkout.id, consignment, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(ConsignmentActionTypes.CreateConsignmentsSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionTypes.CreateConsignmentsFailed, response));
                });
        });
    }

    private _createOrUpdateConsignment(checkoutId: string, consignment: ConsignmentRequestBody, options?: RequestOptions) {
        if (consignment.id) {
            return this._checkoutClient.updateConsignment(checkoutId, consignment, options);
        }

        return this._checkoutClient.createConsignments(checkoutId, [consignment], options);
    }

    private _getConsignmentRequestBody(
        shippingAddress: Address,
        store: ReadableCheckoutStore
    ): ConsignmentRequestBody | undefined {
        const state = store.getState();
        const cart = state.cart.getCart();

        if (!cart || !cart.items) {
            return;
        }

        return {
            shippingAddress,
            lineItems: cart.items
                .filter(item => item.type === 'ItemPhysicalEntity')
                .map(item => ({
                    itemId: item.id,
                    quantity: item.quantity,
                })
            ),
        };
    }
}
