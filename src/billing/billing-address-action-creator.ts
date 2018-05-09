import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Address } from '../address';
import { Checkout, CheckoutClient, InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { BillingAddressAction, BillingAddressActionTypes } from './billing-address-actions';

export default class BillingAddressActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    updateAddress(address: Address, options?: RequestOptions): ThunkAction<BillingAddressAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<BillingAddressAction>) => {
            observer.next(createAction(BillingAddressActionTypes.UpdateBillingAddressRequested));

            this._requestBillingAddressUpdate(store, address, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(BillingAddressActionTypes.UpdateBillingAddressSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(BillingAddressActionTypes.UpdateBillingAddressFailed, response));
                });
        });
    }

    private _requestBillingAddressUpdate(store: ReadableCheckoutStore, address: Address, options?: RequestOptions): Promise<Response<Checkout>> {
        const state = store.getState();
        const checkout = state.checkout.getCheckout();

        if (!checkout || !checkout.id) {
            throw new MissingDataError('Unable to update shipping address: "checkout.id" is missing.');
        }

        const billingAddress = state.billingAddress.getBillingAddress();

        if (!billingAddress || !billingAddress.id) {
            return this._checkoutClient.createBillingAddress(checkout.id, address, options);
        }

        const customer = state.customer.getCustomer();
        const updatedBillingAddress = {
            ...address,
            email: customer ? customer.email : undefined,
            id: billingAddress.id,
        };
        return this._checkoutClient.updateBillingAddress(checkout.id, updatedBillingAddress, options);
    }
}
