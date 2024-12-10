import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { PaymentMethodActionCreator } from '../payment';

import {
    CheckoutButtonActionType,
    DeinitializeButtonAction,
    InitializeButtonAction,
} from './checkout-button-actions';
import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import CheckoutButtonRegistryV2 from './checkout-button-strategy-registry-v2';

export default class HeadlessCheckoutWalletStrategyActionCreator {
    constructor(
        private _registryV2: CheckoutButtonRegistryV2,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
    ) {}

    initialize(
        options: CheckoutButtonInitializeOptions,
    ): ThunkAction<InitializeButtonAction, InternalCheckoutSelectors> {
        return (store) => {
            const meta = {
                methodId: options.methodId,
                containerId: options.containerId,
            };

            if (
                store.getState().checkoutButton.isInitialized(options.methodId, options.containerId)
            ) {
                return empty();
            }

            return concat(
                of(
                    createAction(
                        CheckoutButtonActionType.InitializeButtonRequested,
                        undefined,
                        meta,
                    ),
                ),
                this._paymentMethodActionCreator.loadPaymentWalletWithInitializationData(
                    options.methodId,
                )(store),
                defer(() =>
                    this._registryV2
                        .get({ id: options.methodId })
                        .initialize(options)
                        .then(() =>
                            createAction(
                                CheckoutButtonActionType.InitializeButtonSucceeded,
                                undefined,
                                meta,
                            ),
                        ),
                ),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(CheckoutButtonActionType.InitializeButtonFailed, error, meta),
                ),
            );
        };
    }

    deinitialize(
        options: CheckoutButtonOptions,
    ): ThunkAction<DeinitializeButtonAction, InternalCheckoutSelectors> {
        return (store) => {
            const meta = { methodId: options.methodId };

            if (!store.getState().checkoutButton.isInitialized(options.methodId)) {
                return empty();
            }

            return concat(
                of(
                    createAction(
                        CheckoutButtonActionType.DeinitializeButtonRequested,
                        undefined,
                        meta,
                    ),
                ),
                defer(() =>
                    this._registryV2
                        .get({ id: options.methodId })
                        .deinitialize()
                        .then(() =>
                            createAction(
                                CheckoutButtonActionType.DeinitializeButtonSucceeded,
                                undefined,
                                meta,
                            ),
                        ),
                ),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(
                        CheckoutButtonActionType.DeinitializeButtonFailed,
                        error,
                        meta,
                    ),
                ),
            );
        };
    }
}
