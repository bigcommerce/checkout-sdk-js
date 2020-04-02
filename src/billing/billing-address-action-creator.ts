import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Response } from '@bigcommerce/request-sender';
import { concat, defer, empty, merge, of, Observable, Observer } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Checkout, InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { GuestCredentials } from '../customer';
import { SubscriptionsActionCreator, UpdateSubscriptionsAction } from '../subscription';

import { BillingAddressRequestSender } from '.';
import { BillingAddressUpdateRequestBody } from './billing-address';
import { BillingAddressActionType, ContinueAsGuestAction, UpdateBillingAddressAction } from './billing-address-actions';
import { UnableToContinueAsGuestError } from './errors';

export default class BillingAddressActionCreator {
    constructor(
        private _requestSender: BillingAddressRequestSender,
        private _subscriptionActionCreator: SubscriptionsActionCreator
    ) {}

    continueAsGuest(
        credentials: GuestCredentials,
        options?: RequestOptions
    ): ThunkAction<ContinueAsGuestAction | UpdateSubscriptionsAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const customer = state.customer.getCustomer();

            if (customer && !customer.isGuest) {
                throw new UnableToContinueAsGuestError();
            }

            const billingAddress = state.billingAddress.getBillingAddress();

            let billingAddressRequestBody: Partial<BillingAddressUpdateRequestBody>;

            if (!billingAddress) {
                billingAddressRequestBody = credentials;
            } else {
                const { country, ...existingBillingAddressRequestBody } = billingAddress;

                billingAddressRequestBody = {
                    ...existingBillingAddressRequestBody,
                    ...credentials,
                };
            }

            return merge(
                concat(
                    of(createAction(BillingAddressActionType.ContinueAsGuestRequested)),
                    defer(async () => {
                        const { body } = await this._createOrUpdateBillingAddress(
                            checkout.id,
                            billingAddressRequestBody,
                            options
                        );

                        return createAction(BillingAddressActionType.ContinueAsGuestSucceeded, body);
                    })
                ).pipe(
                    catchError(error => throwErrorAction(BillingAddressActionType.ContinueAsGuestFailed, error))
                ),
                this._updateCustomerConsent(credentials, options)
            );
        };
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

    private _updateCustomerConsent(
        {
            email,
            acceptsAbandonedCartEmails,
            acceptsMarketingNewsletter,
        }: GuestCredentials,
        options?: RequestOptions
    ): Observable<UpdateSubscriptionsAction> {
        if ((acceptsAbandonedCartEmails === undefined || acceptsAbandonedCartEmails === null) &&
            (acceptsMarketingNewsletter === undefined || acceptsMarketingNewsletter === null)) {
            return empty();
        }

        return this._subscriptionActionCreator.updateSubscriptions({
            email,
            acceptsMarketingNewsletter: acceptsMarketingNewsletter || false,
            acceptsAbandonedCartEmails: acceptsAbandonedCartEmails || false,
        }, options);
    }

    private _createOrUpdateBillingAddress(
        checkoutId: string,
        address: Partial<BillingAddressUpdateRequestBody>,
        options?: RequestOptions
    ): Promise<Response<Checkout>> {
        if (!address.id) {
            return this._requestSender.createAddress(checkoutId, address, options);
        }

        return this._requestSender.updateAddress(checkoutId, address, options);
    }
}
