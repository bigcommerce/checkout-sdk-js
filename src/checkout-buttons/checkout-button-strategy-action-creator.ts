import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
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

    initialize(options: CheckoutButtonInitializeOptions): ThunkAction<InitializeButtonAction, InternalCheckoutSelectors> {
        return store => {
            const { methodId, containerId, timeout } = options;
            const meta = { methodId, containerId };

            if (!methodId) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            if (store.getState().checkoutButton.isInitialized(methodId, containerId)) {
                return empty();
            }

            return concat(
                of(createAction(CheckoutButtonActionType.InitializeButtonRequested, undefined, meta)),
                this._paymentMethodActionCreator.loadPaymentMethod(methodId, { timeout, useCache: true }),
                defer(() => this._registry.get(methodId).initialize(options)
                    .then(() => createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, meta)))
            ).pipe(
                catchError(error => throwErrorAction(CheckoutButtonActionType.InitializeButtonFailed, error, meta))
            );
        };
    }

    deinitialize(options: CheckoutButtonOptions): ThunkAction<DeinitializeButtonAction, InternalCheckoutSelectors> {
        return store => {
            const meta = { methodId: options.methodId };

            if (!store.getState().checkoutButton.isInitialized(options.methodId)) {
                return empty();
            }

            return concat(
                of(createAction(CheckoutButtonActionType.DeinitializeButtonRequested, undefined, meta)),
                defer(() => this._registry.get(options.methodId).deinitialize()
                    .then(() => createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, meta)))
            ).pipe(
                catchError(error => throwErrorAction(CheckoutButtonActionType.DeinitializeButtonFailed, error, meta))
            );
        };
    }
}
