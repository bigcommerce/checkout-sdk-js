import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { find } from 'lodash';
import { Observable, Observer } from 'rxjs';

import { AddressRequestBody } from '../address';
import { Cart } from '../cart';
import { CheckoutIncludes, CheckoutParams, CheckoutRequestSender, InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import Consignment, { ConsignmentsRequestBody, ConsignmentAssignmentBaseRequestBodyWithAddress, ConsignmentAssignmentBaseRequestBodyWithShippingAddress, ConsignmentAssignmentRequestBody, ConsignmentCreateRequestBody, ConsignmentLineItem, ConsignmentRequestBody, ConsignmentShippingOptionRequestBody, ConsignmentUpdateRequestBody } from './consignment';
import { ConsignmentActionType, CreateConsignmentsAction, DeleteConsignmentAction, LoadShippingOptionsAction, UpdateConsignmentAction, UpdateShippingOptionAction } from './consignment-actions';
import ConsignmentRequestSender from './consignment-request-sender';

export default class ConsignmentActionCreator {
    constructor(
        private _consignmentRequestSender: ConsignmentRequestSender,
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    unassignItemsByAddress(
        consignment: ConsignmentAssignmentRequestBody,
        options?: RequestOptions
    ): ThunkAction<DeleteConsignmentAction | UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const address = this._consignmentHasAddress(consignment) ? consignment.address : consignment.shippingAddress;

            const existingConsignment = state.consignments.getConsignmentByAddress(address);

            if (!existingConsignment) {
                throw new InvalidArgumentError('No consignment found for the specified address');
            }

            const lineItems = this._removeLineItems(
                consignment.lineItems,
                existingConsignment,
                state.cart.getCart()
            );

            if (!lineItems.length) {
                return this.deleteConsignment(existingConsignment.id, options)(store);
            }

            return this.updateConsignment({
                id: existingConsignment.id,
                address,
                lineItems,
            }, options)(store);
        };
    }

    assignItemsByAddress(
        consignment: ConsignmentAssignmentRequestBody,
        options?: RequestOptions
    ): ThunkAction<UpdateConsignmentAction | CreateConsignmentsAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const address = this._consignmentHasAddress(consignment) ? consignment.address : consignment.shippingAddress;
            const existingConsignment = state.consignments.getConsignmentByAddress(address);

            return this._createOrUpdateConsignment({
                id: existingConsignment && existingConsignment.id,
                address,
                lineItems: this._addLineItems(
                    consignment.lineItems,
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
                    include: [CheckoutIncludes.AvailableShippingOptions],
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
        options?: RequestOptions<CheckoutParams>
    ): ThunkAction<CreateConsignmentsAction | UpdateConsignmentAction, InternalCheckoutSelectors> {
        return store => {
            const consignment = this._getUpdateAddressRequestBody(address, store);
            const consignments = store.getState().consignments.getConsignments();

            if (consignments && consignments.length) {
                (consignment as ConsignmentUpdateRequestBody).id = consignments[0].id;
            }

            return this._createOrUpdateConsignment(consignment, options)(store);
        };
    }

    createConsignments(
        consignments: ConsignmentsRequestBody,
        options?: RequestOptions<CheckoutParams>
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
        options?: RequestOptions<CheckoutParams>
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

    deleteConsignment(
        consignmentId: string,
        options?: RequestOptions
    ): ThunkAction<DeleteConsignmentAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<DeleteConsignmentAction>) => {
            const checkout = store.getState().checkout.getCheckout();
            const consignmentMeta = { id: consignmentId };

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            observer.next(createAction(ConsignmentActionType.DeleteConsignmentRequested, undefined, consignmentMeta));

            this._consignmentRequestSender.deleteConsignment(checkout.id, consignmentId, options)
                .then(({ body }) => {
                    observer.next(createAction(ConsignmentActionType.DeleteConsignmentSucceeded, body, consignmentMeta));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConsignmentActionType.DeleteConsignmentFailed, response, consignmentMeta));
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
        options?: RequestOptions<CheckoutParams>
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

    private _getUpdateAddressRequestBody(
        address: AddressRequestBody,
        store: ReadableCheckoutStore
    ): ConsignmentRequestBody {
        const state = store.getState();
        const cart = state.cart.getCart();

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }
        const { physicalItems, customItems = [] } = cart.lineItems;

        return {
            address,
            lineItems: [ ...physicalItems, ...customItems ].map(item => ({
                itemId: item.id,
                quantity: item.quantity,
            })),
        };
    }

    private _removeLineItems(
        lineItems: ConsignmentLineItem[],
        consignment: Consignment,
        cart?: Cart
    ): ConsignmentLineItem[] {
        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        return this._hydrateLineItems(consignment.lineItemIds, cart).map(existingItem => {
            const sharedItem = find(lineItems, lineItem => lineItem.itemId === existingItem.itemId);

            return {
                ...existingItem,
                quantity: sharedItem ? (existingItem.quantity - sharedItem.quantity) : existingItem.quantity,
            };
        }).filter(lineItem => lineItem.quantity > 0);
    }

    private _addLineItems(
        lineItems: ConsignmentLineItem[],
        consignment?: Consignment,
        cart?: Cart
    ): ConsignmentLineItem[] {
        if (!consignment) {
            return lineItems;
        }

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        return lineItems
            .concat(this._hydrateLineItems(consignment.lineItemIds, cart))
            .filter(lineItem => lineItem.quantity > 0);
    }

    private _hydrateLineItems(lineItemIds: string[], cart: Cart): ConsignmentLineItem[] {
        return lineItemIds.map(itemId => {
            const item = find(cart.lineItems.physicalItems, lineItem => lineItem.id === itemId);

            return {
                itemId,
                quantity: item ? item.quantity : 0,
            };
        });
    }

    private _isUpdateConsignmentRequest(
        request: ConsignmentRequestBody
    ): request is ConsignmentUpdateRequestBody {
        const updateRequest = request as ConsignmentUpdateRequestBody;

        return !!updateRequest.id;
    }

    private _consignmentHasAddress(
        consignment: ConsignmentAssignmentBaseRequestBodyWithAddress | ConsignmentAssignmentBaseRequestBodyWithShippingAddress
    ): consignment is ConsignmentAssignmentBaseRequestBodyWithAddress {
        return typeof consignment === 'object' && 'address' in consignment;
    }
}
