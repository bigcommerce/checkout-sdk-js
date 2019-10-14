import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { AddressRequestBody } from '../address';
import { InternalCheckoutSelectors } from '../checkout';
import { Registry } from '../common/registry';

import { ShippingInitializeOptions, ShippingRequestOptions } from './shipping-request-options';
import { ShippingStrategyActionType, ShippingStrategyDeinitializeAction, ShippingStrategyInitializeAction, ShippingStrategySelectOptionAction, ShippingStrategyUpdateAddressAction } from './shipping-strategy-actions';
import { ShippingStrategy } from './strategies';

export default class ShippingStrategyActionCreator {
    constructor(
        private _strategyRegistry: Registry<ShippingStrategy>
    ) {}

    updateAddress(address: Partial<AddressRequestBody>, options?: ShippingRequestOptions): ThunkAction<ShippingStrategyUpdateAddressAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<ShippingStrategyUpdateAddressAction>) => {
            const payment = store.getState().payment.getPaymentId();
            const methodId = options && options.methodId || payment && payment.providerId;

            observer.next(createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId }));

            this._strategyRegistry.get(methodId)
                .updateAddress(address, { ...options, methodId })
                .then(() => {
                    observer.next(createAction(ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(ShippingStrategyActionType.UpdateAddressFailed, error, { methodId }));
                });
        });
    }

    selectOption(shippingOptionId: string, options?: ShippingRequestOptions): ThunkAction<ShippingStrategySelectOptionAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<ShippingStrategySelectOptionAction>) => {
            const payment = store.getState().payment.getPaymentId();
            const methodId = options && options.methodId || payment && payment.providerId;

            observer.next(createAction(ShippingStrategyActionType.SelectOptionRequested, undefined, { methodId }));

            this._strategyRegistry.get(methodId)
                .selectOption(shippingOptionId, { ...options, methodId })
                .then(() => {
                    observer.next(createAction(ShippingStrategyActionType.SelectOptionSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(ShippingStrategyActionType.SelectOptionFailed, error, { methodId }));
                });
        });
    }

    initialize(options?: ShippingInitializeOptions): ThunkAction<ShippingStrategyInitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<ShippingStrategyInitializeAction>) => {
            const state = store.getState();
            const payment = state.payment.getPaymentId();
            const methodId = options && options.methodId || payment && payment.providerId;
            const mergedOptions = { ...options, methodId };

            if (methodId && state.shippingStrategies.isInitialized(methodId)) {
                return observer.complete();
            }

            observer.next(createAction(ShippingStrategyActionType.InitializeRequested, undefined, { methodId }));

            this._strategyRegistry.get(methodId)
                .initialize(mergedOptions)
                .then(() => {
                    observer.next(createAction(ShippingStrategyActionType.InitializeSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(ShippingStrategyActionType.InitializeFailed, error, { methodId }));
                });
        });
    }

    deinitialize(options?: ShippingRequestOptions): ThunkAction<ShippingStrategyDeinitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<ShippingStrategyDeinitializeAction>) => {
            const state = store.getState();
            const payment = state.payment.getPaymentId();
            const methodId = options && options.methodId || payment && payment.providerId;

            if (methodId && !state.shippingStrategies.isInitialized(methodId)) {
                return observer.complete();
            }

            observer.next(createAction(ShippingStrategyActionType.DeinitializeRequested, undefined, { methodId }));

            this._strategyRegistry.get(methodId)
                .deinitialize({ ...options, methodId })
                .then(() => {
                    observer.next(createAction(ShippingStrategyActionType.DeinitializeSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(ShippingStrategyActionType.DeinitializeFailed, error, { methodId }));
                });
        });
    }
}
