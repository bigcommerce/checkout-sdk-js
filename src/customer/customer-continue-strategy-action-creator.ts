import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { Registry } from '../common/registry';

import { CustomerContinueStrategy } from './continue-strategies';
import { CustomerContinueStrategyActionType, CustomerContinueStrategyExecuteBeforeContinueAsGuestAction, CustomerContinueStrategyExecuteBeforeSignInAction, CustomerContinueStrategyExecuteBeforeSignUpAction, CustomerContinueStrategyDeinitializeAction, CustomerContinueStrategyInitializeAction } from './customer-continue-strategy-actions';
import { CustomerContinueOptions, CustomerContinueRequestOptions } from './customer-continue-request-options';

export default class CustomerContinueStrategyActionCreator {
    constructor(
        private _strategyRegistry: Registry<CustomerContinueStrategy>
    ) {}

    initialize(options?: CustomerContinueRequestOptions): ThunkAction<CustomerContinueStrategyInitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CustomerContinueStrategyInitializeAction>) => {
            console.log('-- CustomerContinueStrategyActionCreator initialize', options);
            const state = store.getState();
            const methodId = options && options.methodId;
            const meta = { methodId };

            if (methodId && state.customerContinueStrategies.isInitialized(methodId)) {
                return observer.complete();
            }

            observer.next(createAction(CustomerContinueStrategyActionType.InitializeRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .initialize(options)
                .then(() => {
                    observer.next(createAction(CustomerContinueStrategyActionType.InitializeSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerContinueStrategyActionType.InitializeFailed, error, meta));
                });
        });
    }

    deinitialize(options?: CustomerContinueRequestOptions): ThunkAction<CustomerContinueStrategyDeinitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<CustomerContinueStrategyDeinitializeAction>) => {
            console.log('-- CustomerContinueStrategyActionCreator deinitialize', options);
            const state = store.getState();
            const methodId = options && options.methodId;
            const meta = { methodId };

            if (methodId && !state.customerContinueStrategies.isInitialized(methodId)) {
                return observer.complete();
            }

            observer.next(createAction(CustomerContinueStrategyActionType.DeinitializeRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .deinitialize(options)
                .then(() => {
                    observer.next(createAction(CustomerContinueStrategyActionType.DeinitializeSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerContinueStrategyActionType.DeinitializeFailed, error, meta));
                });
        });
    }

    executeBeforeContinueAsGuest(options?: CustomerContinueOptions): Observable<CustomerContinueStrategyExecuteBeforeContinueAsGuestAction> {
        return Observable.create((observer: Observer<CustomerContinueStrategyExecuteBeforeContinueAsGuestAction>) => {
            console.log('-- CustomerContinueStrategyActionCreator customContinueAsGuest', options);
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .executeBeforeContinueAsGuest(options)
                .then(() => {
                    observer.next(createAction(CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestFailed, error, meta));
                });
        });
    }

    executeBeforeSignIn(options?: CustomerContinueOptions): Observable<CustomerContinueStrategyExecuteBeforeSignInAction> {
        return Observable.create((observer: Observer<CustomerContinueStrategyExecuteBeforeSignInAction>) => {
            console.log('-- CustomerContinueStrategyActionCreator customSignIn', options);
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerContinueStrategyActionType.ExecuteBeforeSignInRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .executeBeforeSignIn(options)
                .then(() => {
                    observer.next(createAction(CustomerContinueStrategyActionType.ExecuteBeforeSignInSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerContinueStrategyActionType.ExecuteBeforeSignInFailed, error, meta));
                });
        });
    }

    executeBeforeSignUp(options?: CustomerContinueOptions): Observable<CustomerContinueStrategyExecuteBeforeSignUpAction> {
        return Observable.create((observer: Observer<CustomerContinueStrategyExecuteBeforeSignUpAction>) => {
            console.log('-- CustomerContinueStrategyActionCreator customSignUp', options);
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerContinueStrategyActionType.ExecuteBeforeSignUpRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .executeBeforeSignUp(options)
                .then(() => {
                    observer.next(createAction(CustomerContinueStrategyActionType.ExecuteBeforeSignUpSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerContinueStrategyActionType.ExecuteBeforeSignUpFailed, error, meta));
                });
        });
    }
}
