import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { find, map } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { AddressRequestBody } from '../address';
import { Cart } from '../cart';
import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import CheckoutRequestSender from '../checkout/checkout-request-sender';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import Consignment, {
    ConsignmentsRequestBody,
    ConsignmentAddressAssignmentRequestBody,
    ConsignmentAssignmentRequestBody,
    ConsignmentCreateRequestBody,
    ConsignmentIdAssignmentRequestBody,
    ConsignmentLineItem,
    ConsignmentRequestBody,
    ConsignmentShippingOptionRequestBody,
    ConsignmentUpdateRequestBody
} from './consignment';
import {
    ConsignmentActionType,
    CreateConsignmentsAction,
    LoadShippingOptionsAction,
    UpdateConsignmentAction,
    UpdateShippingOptionAction,
} from './consignment-actions';
import ConsignmentRequestSender from './consignment-request-sender';

export default class ConsignmentActionCreator {
    constructor(
        private _consignmentRequestSender: ConsignmentRequestSender,
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    assignItemsByAddress(
        consignment: ConsignmentAddressAssignmentRequestBody,
        options?: RequestOptions
    ): ThunkAction<CreateConsignmentsAction | UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const existingConsignment = state.consignments.getConsignmentByAddress(consignment.shippingAddress);

            return this._createOrUpdateConsignment({
                id: existingConsignment && existingConsignment.id,
                shippingAddress: consignment.shippingAddress,
                lineItems: this._combineLineItems(
                    consignment,
                    existingConsignment,
                    state.cart.getCart()
                ),
            }, options)(store);
        };
    }

    assignItemsByConsignmentId(
        consignment: ConsignmentIdAssignmentRequestBody,
        options?: RequestOptions
    ): ThunkAction<UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const existingConsignment = this._getConsignmentById(store, consignment.id);

            if (!existingConsignment) {
                throw new InvalidArgumentError('Invalid consignment was provided');
            }

            return this.updateConsignment({
                id: existingConsignment.id,
                shippingAddress: existingConsignment.shippingAddress,
                lineItems: this._combineLineItems(
                    consignment,
                    existingConsignment,
                    state.cart.getCart()
                ),
            }, options)(store);
        };
    }

    selectShippingOption(
        id: string,
        options?: RequestOptions
    ): ThunkAction<UpdateShippingOptionAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateShippingOptionAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();
            const consignments = state.consignments.getConsignments();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            if (!consignments || !consignments.length) {
                throw new MissingDataError(MissingDataErrorType.MissingConsignments);
            }

            const consignmentUpdateBody = {
                id: consignments[0].id,
                shippingOptionId: id,
            };

            const consignmentMeta = {
                id: consignments[0].id,
            };

            observer.next(createAction(ConsignmentActionType.UpdateShippingOptionRequested, undefined, consignmentMeta));

            this._consignmentRequestSender.updateConsignment(checkout.id, consignmentUpdateBody, options)
                .then(({ body }) => {
                    observer.next(createAction(
                        ConsignmentActionType.UpdateShippingOptionSucceeded,
                        body,
                        consignmentMeta
                    ));

                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(
                        ConsignmentActionType.UpdateShippingOptionFailed,
                        response,
                        consignmentMeta
                    ));
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

    updateAddress(
        address: AddressRequestBody,
        options?: RequestOptions
    ): ThunkAction<CreateConsignmentsAction | UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => {
            const consignment = this._getConsignmentRequestBody(address, store);
            const consignments = store.getState().consignments.getConsignments();

            if (consignments && consignments.length) {
                (consignment as ConsignmentUpdateRequestBody).id = consignments[0].id;
            }

            return this._createOrUpdateConsignment(consignment, options)(store);
        };
    }

    createConsignments(
        consignments: ConsignmentsRequestBody,
        options?: RequestOptions
    ): ThunkAction<CreateConsignmentsAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CreateConsignmentsAction>) => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            observer.next(createAction(ConsignmentActionType.CreateConsignmentsRequested));

            this._consignmentRequestSender.createConsignments(checkout.id, consignments, options)
                .then(({ body }) => {
                    observer.next(createAction(ConsignmentActionType.CreateConsignmentsSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionType.CreateConsignmentsFailed, response));
                });
        });
    }

    updateConsignment(
        consignment: ConsignmentUpdateRequestBody,
        options?: RequestOptions
    ): ThunkAction<UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateConsignmentAction>) => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const consignmentMeta = { id: consignment.id };

            observer.next(createAction(ConsignmentActionType.UpdateConsignmentRequested, undefined, consignmentMeta));

            this._consignmentRequestSender.updateConsignment(checkout.id, consignment, options)
                .then(({ body }) => {
                    observer.next(createAction(ConsignmentActionType.UpdateConsignmentSucceeded, body, consignmentMeta));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionType.UpdateConsignmentFailed, response, consignmentMeta));
                });
        });
    }

    updateShippingOption(
        consignment: ConsignmentShippingOptionRequestBody,
        options?: RequestOptions
    ): ThunkAction<UpdateShippingOptionAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateShippingOptionAction>) => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const consignmentMeta = { id: consignment.id };

            observer.next(createAction(ConsignmentActionType.UpdateShippingOptionRequested, undefined, consignmentMeta));

            this._consignmentRequestSender.updateConsignment(checkout.id, consignment, options)
                .then(({ body }) => {
                    observer.next(createAction(ConsignmentActionType.UpdateShippingOptionSucceeded, body, consignmentMeta));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionType.UpdateShippingOptionFailed, response, consignmentMeta));
                });
        });
    }

    private _createOrUpdateConsignment(
        consignment: ConsignmentCreateRequestBody | ConsignmentUpdateRequestBody,
        options?: RequestOptions
    ): ThunkAction<UpdateConsignmentAction | CreateConsignmentsAction, InternalCheckoutSelectors> {
        return store => {
            const checkout = store.getState().checkout.getCheckout();

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            if (this._isUpdateConsignmentRequest(consignment)) {
                return this.updateConsignment(consignment, options)(store);
            }

            return this.createConsignments([consignment], options)(store);
        };
    }

    private _getConsignmentRequestBody(
        shippingAddress: AddressRequestBody,
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

    private _getConsignmentById(store: ReadableCheckoutStore, id: string): Consignment | undefined {
        const consignments = store.getState().consignments.getConsignments();

        if (!consignments || !consignments.length) {
            return undefined;
        }

        return find(consignments, { id });
    }

    private _combineLineItems(
        consignment: ConsignmentAssignmentRequestBody,
        existingConsignment?: Consignment,
        cart?: Cart
    ): ConsignmentLineItem[] {
        if (!existingConsignment) {
            return consignment.lineItems;
        }

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        const existingLineItems = map(existingConsignment.lineItemIds, itemId => {
            const item = find(cart.lineItems.physicalItems, { id: itemId });

            return {
                itemId,
                quantity: item ? item.quantity : 0,
            };
        });

        return consignment.lineItems.concat(existingLineItems);
    }

    private _isUpdateConsignmentRequest(
        request: ConsignmentRequestBody
    ): request is ConsignmentUpdateRequestBody {
        const updateRequest = request as ConsignmentUpdateRequestBody;

        return typeof updateRequest.id !== 'undefined' && !!updateRequest.id;
    }
}
