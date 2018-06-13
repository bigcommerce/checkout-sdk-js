import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { defer } from 'rxjs/observable/defer';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export default class CheckoutActionCreator {
    constructor(
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    loadCheckout(id: string, options?: RequestOptions): Observable<CheckoutAction> {
        return Observable.create((observer: Observer<CheckoutAction>) => {
            observer.next(createAction(CheckoutActionType.LoadCheckoutRequested));

            this._checkoutRequestSender.loadCheckout(id, options)
                .then(({ body }) => {
                    observer.next(createAction(CheckoutActionType.LoadCheckoutSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CheckoutActionType.LoadCheckoutFailed, response));
                });
        });
    }

    loadCurrentCheckout(options?: RequestOptions): ThunkAction<CheckoutAction, InternalCheckoutSelectors> {
        return store => defer(() => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to reload the current checkout because "checkout.id" is missing.');
            }

            return this.loadCheckout(checkout.id, options);
        });
    }
}
