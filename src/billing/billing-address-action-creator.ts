import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Checkout, CheckoutClient, InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, MissingDataErrorType, StandardError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { GuestCredentials } from '../customer';

import { BillingAddressUpdateRequestBody } from './billing-address';
import { BillingAddressActionType, UpdateBillingAddressAction } from './billing-address-actions';

export default class BillingAddressActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    continueAsGuest(
        credentials: GuestCredentials,
        options?: RequestOptions
    ): ThunkAction<UpdateBillingAddressAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateBillingAddressAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const customer = state.customer.getCustomer();

            if (customer && !customer.isGuest) {
                throw new StandardError('Cannot continue as guest: customer is logged in.');
            }

            const billingAddress = state.billingAddress.getBillingAddress();

            let billingAddressRequestBody;

            if (!billingAddress) {
                billingAddressRequestBody = credentials;
            } else {
                const { country, ...existingBillingAddressRequestBody } = billingAddress;

                billingAddressRequestBody = {
                    ...existingBillingAddressRequestBody,
                    ...credentials,
                };
            }

            observer.next(createAction(BillingAddressActionType.UpdateBillingAddressRequested));

            this._createOrUpdateBillingAddress(checkout.id, billingAddressRequestBody, options)
                .then(({ body }) => {
                    observer.next(createAction(BillingAddressActionType.UpdateBillingAddressSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(BillingAddressActionType.UpdateBillingAddressFailed, response));
                });
        });
    }

    updateAddress(
        address: Partial<BillingAddressUpdateRequestBody>,
        options?: RequestOptions
    ): ThunkAction<UpdateBillingAddressAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateBillingAddressAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            observer.next(createAction(BillingAddressActionType.UpdateBillingAddressRequested));

            const billingAddress = state.billingAddress.getBillingAddress();

            // If email is not present in the address provided by the client, then
            // fall back to the stored email as it could have been set separately
            // using a convenience method. We can't rely on billingAddress having
            // an ID to consider that there's a preexisting email, as billingAddress
            // object from Order doesn't have an ID.
            const billingAddressRequestBody = {
                ...address,
                email: typeof address.email === 'undefined' && billingAddress ? billingAddress.email : address.email,
            };

            if (billingAddress && billingAddress.id) {
                billingAddressRequestBody.id = billingAddress.id;
            }

            this._createOrUpdateBillingAddress(checkout.id, billingAddressRequestBody, options)
                .then(({ body }) => {
                    observer.next(createAction(BillingAddressActionType.UpdateBillingAddressSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(BillingAddressActionType.UpdateBillingAddressFailed, response));
                });
        });
    }

    private _createOrUpdateBillingAddress(
        checkoutId: string,
        address: Partial<BillingAddressUpdateRequestBody>,
        options?: RequestOptions
    ): Promise<Response<Checkout>> {
        if (!address.id) {
            return this._checkoutClient.createBillingAddress(checkoutId, address, options);
        }

        return this._checkoutClient.updateBillingAddress(checkoutId, address, options);
    }
}
