import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Address } from '../address';
import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import CheckoutRequestSender from '../checkout/checkout-request-sender';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { ConsignmentRequestBody, ConsignmentsRequestBody } from './consignment';
import ConsignmentRequestSender from './consignment-request-sender';

import {
    ConsignmentActionType,
    CreateConsignmentsAction,
    LoadShippingOptionsAction,
    UpdateConsignmentAction,
} from './consignment-actions';

export default class ConsignmentActionCreator {
    constructor(
        private _consignmentRequestSender: ConsignmentRequestSender,
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    selectShippingOption(id: string, options?: RequestOptions): ThunkAction<UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateConsignmentAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();
            const address = state.shippingAddress.getShippingAddress();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            if (!address) {
                throw new MissingDataError(MissingDataErrorType.MissingShippingAddress);
            }

            observer.next(createAction(ConsignmentActionType.UpdateConsignmentRequested));

            const consignmentUpdateBody = {
                id: address.id,
                shippingOptionId: id,
            };

            this._consignmentRequestSender.updateConsignment(checkout.id, consignmentUpdateBody, options)
                .then(({ body }) => {
                    observer.next(createAction(ConsignmentActionType.UpdateConsignmentSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionType.UpdateConsignmentFailed, response));
                });
        });
    }

    loadShippingOptions(options?: RequestOptions): ThunkAction<LoadShippingOptionsAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<LoadShippingOptionsAction>) => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            observer.next(createAction(ConsignmentActionType.LoadShippingOptionsRequested));

            this._checkoutRequestSender.loadCheckout(checkout.id, {
                ...options,
                params: {
                    include: ['consignments.availableShippingOptions'],
                },
            })
            .then(({ body }) => {
                observer.next(createAction(ConsignmentActionType.LoadShippingOptionsSucceeded, body));
                observer.complete();
            })
            .catch(response => {
                observer.error(createErrorAction(ConsignmentActionType.LoadShippingOptionsFailed, response));
            });
        });
    }

    updateAddress(address: Address, options?: RequestOptions): ThunkAction<CreateConsignmentsAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CreateConsignmentsAction>) => {
            const consignment = this._getConsignmentRequestBody(address, store);
            const checkout = store.getState().checkout.getCheckout();
            const consignments = store.getState().consignments.getConsignments();

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            if (consignments && consignments.length) {
                consignment.id = consignments[0].id;
            }

            observer.next(createAction(ConsignmentActionType.CreateConsignmentsRequested));

            this._createOrUpdateConsignment(checkout.id, consignment, options)
                .then(({ body }) => {
                    observer.next(createAction(ConsignmentActionType.CreateConsignmentsSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionType.CreateConsignmentsFailed, response));
                });
        });
    }

    createConsignments(consigments: ConsignmentsRequestBody, options?: RequestOptions): ThunkAction<CreateConsignmentsAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CreateConsignmentsAction>) => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            observer.next(createAction(ConsignmentActionType.CreateConsignmentsRequested));

            this._consignmentRequestSender.createConsignments(checkout.id, consigments, options)
                .then(({ body }) => {
                    observer.next(createAction(ConsignmentActionType.CreateConsignmentsSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionType.CreateConsignmentsFailed, response));
                });
        });
    }

    private _createOrUpdateConsignment(
        checkoutId: string,
        consignment: ConsignmentRequestBody,
        options?: RequestOptions
    ) {
        if (consignment.id) {
            return this._consignmentRequestSender.updateConsignment(checkoutId, consignment, options);
        }

        return this._consignmentRequestSender.createConsignments(checkoutId, [consignment], options);
    }

    private _getConsignmentRequestBody(
        shippingAddress: Address,
        store: ReadableCheckoutStore
    ): ConsignmentRequestBody {
        const state = store.getState();
        const cart = state.cart.getCart();

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        return {
            shippingAddress,
            lineItems: (cart.lineItems && cart.lineItems.physicalItems || [])
                .map(item => ({
                    itemId: item.id,
                    quantity: item.quantity,
                })
            ),
        };
    }
}
