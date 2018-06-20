import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { AddressRequestBody } from '../address';
import { Checkout, CheckoutClient, InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { BillingAddressActionType, UpdateBillingAddressAction } from './billing-address-actions';

export default class BillingAddressActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    updateAddress(address: Partial<AddressRequestBody>, options?: RequestOptions): ThunkAction<UpdateBillingAddressAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateBillingAddressAction>) => {
            observer.next(createAction(BillingAddressActionType.UpdateBillingAddressRequested));

            this._requestBillingAddressUpdate(store, address, options)
                .then(({ body }) => {
                    observer.next(createAction(BillingAddressActionType.UpdateBillingAddressSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(BillingAddressActionType.UpdateBillingAddressFailed, response));
                });
        });
    }

    private _requestBillingAddressUpdate(store: ReadableCheckoutStore, address: Partial<AddressRequestBody>, options?: RequestOptions): Promise<Response<Checkout>> {
        const state = store.getState();
        const checkout = state.checkout.getCheckout();

        if (!checkout || !checkout.id) {
            throw new MissingDataError('Unable to update shipping address: "checkout.id" is missing.');
        }

        const billingAddress = state.billingAddress.getBillingAddress();

        if (!billingAddress || !billingAddress.id) {
            return this._checkoutClient.createBillingAddress(checkout.id, address, options);
        }

        const updatedBillingAddress = {
            ...address,
            email: typeof address.email === 'undefined' ? billingAddress.email : address.email,
            id: billingAddress.id,
        };

        return this._checkoutClient.updateBillingAddress(checkout.id, updatedBillingAddress, options);
    }
}
