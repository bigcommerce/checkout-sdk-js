import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CheckoutButtonStrategy as CheckoutButtonStrategyV2 } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';

import {
    CheckoutButtonActionType,
    DeinitializeButtonAction,
    InitializeButtonAction,
} from './checkout-button-actions';
import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import CheckoutButtonRegistryV2 from './checkout-button-strategy-registry-v2';
import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';

export default class CheckoutButtonStrategyActionCreator {
    constructor(
        private _registry: Registry<CheckoutButtonStrategy>,
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

            const paymentMethodRequestParams = options.currencyCode
                ? { params: { currencyCode: options.currencyCode } }
                : {};

            const paymentMethodRequestOptions = {
                ...paymentMethodRequestParams,
                timeout: options.timeout,
                useCache: true,
            };
            console.log('INIT BUTTON');
            return concat(
                of(
                    createAction(
                        CheckoutButtonActionType.InitializeButtonRequested,
                        undefined,
                        meta,
                    ),
                ),
                this._paymentMethodActionCreator.loadPaymentMethod(
                    options.methodId,
                    paymentMethodRequestOptions,
                )(store),
                defer(() =>
                    this._getStrategy(options.methodId)
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
                    this._getStrategy(options.methodId)
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

    private _getStrategy(
        methodId: CheckoutButtonMethodType,
    ): CheckoutButtonStrategy | CheckoutButtonStrategyV2 {
        let strategy: CheckoutButtonStrategy | CheckoutButtonStrategyV2;

        try {
            strategy = this._registryV2.get({ id: methodId });
        } catch {
            strategy = this._registry.get(methodId);
        }

        return strategy;
    }
}
