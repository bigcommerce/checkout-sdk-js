import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { Registry } from '../common/registry';

import CustomerAccountRequestBody from './customer-account';
import CustomerCredentials from './customer-credentials';
import { CustomerInitializeOptions, CustomerRequestOptions } from './customer-request-options';
import { CustomerStrategyActionType, CustomerStrategyContinueAsGuestAction, CustomerStrategyDeinitializeAction, CustomerStrategyInitializeAction, CustomerStrategySignInAction, CustomerStrategySignOutAction, CustomerStrategySignUpAction, CustomerStrategyWidgetAction } from './customer-strategy-actions';
import { GuestCredentials } from './guest-credentials';
import { CustomerStrategy } from './strategies';

export default class CustomerStrategyActionCreator {
    constructor(
        private _strategyRegistry: Registry<CustomerStrategy>
    ) {}

    continueAsGuest(credentials: GuestCredentials, options?: CustomerRequestOptions): Observable<CustomerStrategyContinueAsGuestAction> {
        return Observable.create((observer: Observer<CustomerStrategyContinueAsGuestAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerStrategyActionType.ContinueAsGuestRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .continueAsGuest(credentials, options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.ContinueAsGuestSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerStrategyActionType.ContinueAsGuestFailed, error, meta));
                });
        });
    }

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

    signUp(customerAccount: CustomerAccountRequestBody, options?: CustomerRequestOptions): Observable<CustomerStrategySignUpAction> {
        return Observable.create((observer: Observer<CustomerStrategySignUpAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(CustomerStrategyActionType.SignUpRequested, undefined, meta));

            this._strategyRegistry.get(methodId)
                .signUp(customerAccount, options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.SignUpSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(CustomerStrategyActionType.SignUpFailed, error, meta));
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
