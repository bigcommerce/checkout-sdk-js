import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { AddressRequestBody } from '../address';
import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import CheckoutRequestSender from '../checkout/checkout-request-sender';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import {
    ConsignmentsRequestBody,
    ConsignmentCreateRequestBody,
    ConsignmentRequestBody,
    ConsignmentShippingOptionRequestBody,
    ConsignmentUpdateRequestBody
} from './consignment';

import ConsignmentRequestSender from './consignment-request-sender';

import {
    ConsignmentActionType,
    CreateConsignmentsAction,
    LoadShippingOptionsAction,
    UpdateConsignmentAction,
    UpdateShippingOptionAction,
} from './consignment-actions';

export default class ConsignmentActionCreator {
    constructor(
        private _consignmentRequestSender: ConsignmentRequestSender,
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

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
    ): ThunkAction<CreateConsignmentsAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CreateConsignmentsAction | UpdateConsignmentAction>) => {
            const consignment = this._getConsignmentRequestBody(address, store);
            const checkout = store.getState().checkout.getCheckout();
            const consignments = store.getState().consignments.getConsignments();

            if (!checkout || !checkout.id) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            if (consignments && consignments.length) {
                (consignment as ConsignmentUpdateRequestBody).id = consignments[0].id;
            }

            this._createOrUpdateConsignment(checkout.id, consignment, observer, options);
        });
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
        consignment: ConsignmentUpdateRequestBody | ConsignmentShippingOptionRequestBody,
        options?: RequestOptions
    ): ThunkAction<UpdateConsignmentAction | UpdateShippingOptionAction, InternalCheckoutSelectors> {
        if (this._isUpdateShippingOptionRequest(consignment)) {
            return this._updateShippingOption(consignment, options);
        }

        return store => Observable.create((observer: Observer<UpdateConsignmentAction | UpdateShippingOptionAction>) => {
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

    private _updateShippingOption(
        consignment: ConsignmentShippingOptionRequestBody,
        options?: RequestOptions
    ): ThunkAction<UpdateConsignmentAction | UpdateShippingOptionAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateConsignmentAction | UpdateShippingOptionAction>) => {
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
        checkoutId: string,
        consignment: ConsignmentCreateRequestBody | ConsignmentUpdateRequestBody,
        observer: Observer<CreateConsignmentsAction | UpdateConsignmentAction>,
        options?: RequestOptions
    ) {
        if ((consignment as ConsignmentUpdateRequestBody).id) {
            const consignmentMeta = { id: (consignment as ConsignmentUpdateRequestBody).id };

            observer.next(createAction(ConsignmentActionType.UpdateConsignmentRequested, undefined, consignmentMeta));

            return this._consignmentRequestSender.updateConsignment(
                checkoutId,
                consignment as ConsignmentUpdateRequestBody,
                options
            )
                .then(({ body }) => {
                    observer.next(createAction(
                        ConsignmentActionType.UpdateConsignmentSucceeded,
                        body,
                        consignmentMeta
                    ));

                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(
                        ConsignmentActionType.UpdateConsignmentFailed,
                        response,
                        consignmentMeta
                    ));
                });
        }

        observer.next(createAction(ConsignmentActionType.CreateConsignmentsRequested, consignment));

        return this._consignmentRequestSender.createConsignments(
            checkoutId,
            [consignment as ConsignmentCreateRequestBody],
            options
        )
            .then(({ body }) => {
                observer.next(createAction(ConsignmentActionType.CreateConsignmentsSucceeded, body, consignment));
                observer.complete();
            })
            .catch(response => {
                observer.error(createErrorAction(ConsignmentActionType.CreateConsignmentsFailed, response, consignment));
            });
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

    private _isUpdateShippingOptionRequest(request: ConsignmentUpdateRequestBody): request is ConsignmentShippingOptionRequestBody {
        const shippingOptionRequest = request as ConsignmentShippingOptionRequestBody;

        return typeof shippingOptionRequest.shippingOptionId !== 'undefined';
    }
}
