import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat } from 'rxjs/observable/concat';
import { defer } from 'rxjs/observable/defer';
import { empty } from 'rxjs/observable/empty';
import { merge } from 'rxjs/observable/merge';
import { of } from 'rxjs/observable/of';
import { catchError, switchMapTo, takeWhile } from 'rxjs/operators';
import { Observable, SubscribableOrPromise } from 'rxjs/Observable';

import { CheckoutActionCreator, InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { LoadCheckoutAction } from '../checkout/checkout-actions';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';

import { CheckoutButtonActionType, DeinitializeButtonAction, InitializeButtonAction } from './checkout-button-actions';
import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import { CheckoutButtonStrategy } from './strategies';

export default class CheckoutButtonStrategyActionCreator {
    constructor(
        private _registry: Registry<CheckoutButtonStrategy>,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): ThunkAction<InitializeButtonAction> {
        return (store: ReadableCheckoutStore) => {
            const meta = { methodId: options.methodId };
            const action$: Observable<InitializeButtonAction> = concat(
                of(createAction(CheckoutButtonActionType.InitializeButtonRequested, undefined, meta)),
                merge(
                    this._loadCheckout(store, options),
                    this._paymentMethodActionCreator.loadPaymentMethod(options.methodId, options)
                ),
                defer(() => this._registry.get(options.methodId).initialize(options)
                    .then(() => createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, meta)))
            );

            return action$.pipe(
                catchError(error => throwErrorAction(CheckoutButtonActionType.InitializeButtonFailed, error, meta))
            );
        };
    }

    deinitialize(options: CheckoutButtonOptions): Observable<DeinitializeButtonAction> {
        const meta = { methodId: options.methodId };
        const action$ = concat(
            of(createAction(CheckoutButtonActionType.DeinitializeButtonRequested, undefined, meta)),
            defer(() => this._registry.get(options.methodId).deinitialize(options)
                .then(() => createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, meta)))
        );

        return action$.pipe(
            catchError(error => throwErrorAction(CheckoutButtonActionType.DeinitializeButtonFailed, error, meta))
        );
    }

    private _loadCheckout(store: ReadableCheckoutStore, options?: RequestOptions): SubscribableOrPromise<LoadCheckoutAction> {
        if (store.getState().checkout.isLoading()) {
            return new Observable<InternalCheckoutSelectors>(observer => store.subscribe(state => observer.next(state)))
                .pipe(
                    takeWhile(state => !state.checkout.getCheckout()),
                    switchMapTo(empty())
                );
        }

        return this._checkoutActionCreator.loadDefaultCheckout(options)(store);
    }
}
