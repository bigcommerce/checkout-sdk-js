import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat } from 'rxjs/observable/concat';
import { defer } from 'rxjs/observable/defer';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { throwErrorAction } from '../common/error';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';

import { CheckoutButtonActionType, DeinitializeButtonAction, InitializeButtonAction } from './checkout-button-actions';
import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import { CheckoutButtonStrategy } from './strategies';

export default class CheckoutButtonStrategyActionCreator {
    constructor(
        private _registry: Registry<CheckoutButtonStrategy>,
        private _paymentMethodActionCreator: PaymentMethodActionCreator
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): ThunkAction<InitializeButtonAction> {
        return store => {
            const meta = { methodId: options.methodId };
            const { paymentMethods } = store.getState();
            const paymentMethod = paymentMethods.getPaymentMethod(options.methodId);

            return concat(
                of(createAction(CheckoutButtonActionType.InitializeButtonRequested, undefined, meta)),
                paymentMethod ?
                    empty() :
                    this._paymentMethodActionCreator.loadPaymentMethod(options.methodId, options),
                defer(() => this._registry.get(options.methodId).initialize(options)
                    .then(() => createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, meta)))
            ).pipe(
                catchError(error => throwErrorAction(CheckoutButtonActionType.InitializeButtonFailed, error, meta))
            );
        };
    }

    deinitialize(options: CheckoutButtonOptions): Observable<DeinitializeButtonAction> {
        const meta = { methodId: options.methodId };

        return concat(
            of(createAction(CheckoutButtonActionType.DeinitializeButtonRequested, undefined, meta)),
            defer(() => this._registry.get(options.methodId).deinitialize()
                .then(() => createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, meta)))
        ).pipe(
            catchError(error => throwErrorAction(CheckoutButtonActionType.DeinitializeButtonFailed, error, meta))
        );
    }
}
