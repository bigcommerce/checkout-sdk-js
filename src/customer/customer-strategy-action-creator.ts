import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { Registry } from '../common/registry';

import CustomerCredentials from './customer-credentials';
import { CustomerContinueOptions, CustomerInitializeOptions, CustomerRequestOptions } from './customer-request-options';
import { CustomerStrategyActionType, CustomerStrategyCustomerContinueAction, CustomerStrategyDeinitializeAction, CustomerStrategyInitializeAction, CustomerStrategySignInAction, CustomerStrategySignOutAction, CustomerStrategyWidgetAction } from './customer-strategy-actions';
import { CustomerStrategy } from './strategies';

export default class CustomerStrategyActionCreator {
    constructor(
        private _strategyRegistry: Registry<CustomerStrategy>
    ) {}

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Observable<CustomerStrategySignInAction> {
        return Observable.create((observer: Observer<CustomerStrategySignInAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerStrategyActionType.SignInRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .signIn(credentials, options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.SignInSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerStrategyActionType.SignInFailed, error, meta));
                });
        });
    }

    signOut(options?: CustomerRequestOptions): Observable<CustomerStrategySignOutAction> {
        return Observable.create((observer: Observer<CustomerStrategySignOutAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerStrategyActionType.SignOutRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .signOut(options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.SignOutSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerStrategyActionType.SignOutFailed, error, meta));
                });
        });
    }

    customerContinue(options?: CustomerContinueOptions): Observable<CustomerStrategyCustomerContinueAction> {
        return Observable.create((observer: Observer<CustomerStrategyCustomerContinueAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerStrategyActionType.CustomerContinueRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .customerContinue(options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.CustomerContinueSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerStrategyActionType.CustomerContinueFailed, error, meta));
                });
        });
    }

    initialize(options?: CustomerInitializeOptions): ThunkAction<CustomerStrategyInitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CustomerStrategyInitializeAction>) => {
            const state = store.getState();
            const methodId = options && options.methodId;
            const meta = { methodId };

            if (methodId && state.customerStrategies.isInitialized(methodId)) {
                return observer.complete();
            }

            observer.next(createAction(CustomerStrategyActionType.InitializeRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .initialize(options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.InitializeSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerStrategyActionType.InitializeFailed, error, meta));
                });
        });
    }

    deinitialize(options?: CustomerRequestOptions): ThunkAction<CustomerStrategyDeinitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CustomerStrategyDeinitializeAction>) => {
            const state = store.getState();
            const methodId = options && options.methodId;
            const meta = { methodId };

            if (methodId && !state.customerStrategies.isInitialized(methodId)) {
                return observer.complete();
            }

            observer.next(createAction(CustomerStrategyActionType.DeinitializeRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .deinitialize(options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.DeinitializeSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerStrategyActionType.DeinitializeFailed, error, meta));
                });
        });
    }

    widgetInteraction(method: () => Promise<any>, options?: CustomerRequestOptions): Observable<CustomerStrategyWidgetAction> {
        return Observable.create((observer: Observer<CustomerStrategyWidgetAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerStrategyActionType.WidgetInteractionStarted, undefined, meta));

            method().then(() => {
                observer.next(createAction(CustomerStrategyActionType.WidgetInteractionFinished, undefined, meta));
                observer.complete();
            })
            .catch(error => {
                observer.error(createErrorAction(CustomerStrategyActionType.WidgetInteractionFailed, error, meta));
            });
        });
    }
}
