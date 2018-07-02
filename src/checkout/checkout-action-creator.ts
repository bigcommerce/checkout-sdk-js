import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { defer } from 'rxjs/observable/defer';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { CheckoutRequestBody } from './checkout';
import { CheckoutActionType, LoadCheckoutAction, UpdateCheckoutAction } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export default class CheckoutActionCreator {
    constructor(
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    loadCheckout(id: string, options?: RequestOptions): Observable<LoadCheckoutAction> {
        return Observable.create((observer: Observer<LoadCheckoutAction>) => {
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

    updateCheckout(body: CheckoutRequestBody, options?: RequestOptions): ThunkAction<UpdateCheckoutAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<UpdateCheckoutAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            observer.next(createAction(CheckoutActionType.UpdateCheckoutRequested));

            this._checkoutRequestSender.updateCheckout(checkout.id, body, options)
                .then(({ body }) => {
                    observer.next(createAction(CheckoutActionType.UpdateCheckoutSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CheckoutActionType.UpdateCheckoutFailed, response));
                });
        });
    }

    loadCurrentCheckout(options?: RequestOptions): ThunkAction<LoadCheckoutAction, InternalCheckoutSelectors> {
        return store => defer(() => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            return this.loadCheckout(checkout.id, options);
        });
    }
}
