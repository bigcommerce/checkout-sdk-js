import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { CustomerStrategy } from './strategies';
import { CustomerStrategyAction, CustomerStrategyActionType } from './customer-strategy-actions';
import { Registry } from '../common/registry';
import CustomerCredentials from './customer-credentials';

export default class CustomerStrategyActionCreator {
    constructor(
        private _strategyRegistry: Registry<CustomerStrategy>
    ) {}

    signIn(credentials: CustomerCredentials, options: CustomerActionOptions = {}): Observable<CustomerStrategyAction> {
        return Observable.create((observer: Observer<CustomerStrategyAction>) => {
            const meta = { methodId: options.methodId };

            observer.next(createAction(CustomerStrategyActionType.SignInRequested, undefined, meta));

            this._strategyRegistry.get(options.methodId)
                .signIn(credentials, options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.SignInSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(CustomerStrategyActionType.SignInFailed, error, meta));
                });
        });
    }

    signOut(options: CustomerActionOptions = {}): Observable<CustomerStrategyAction> {
        return Observable.create((observer: Observer<CustomerStrategyAction>) => {
            const meta = { methodId: options.methodId };

            observer.next(createAction(CustomerStrategyActionType.SignOutRequested, undefined, meta));

            this._strategyRegistry.get(options && options.methodId)
                .signOut(options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.SignOutSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(CustomerStrategyActionType.SignOutFailed, error, meta));
                });
        });
    }

    initialize(options: CustomerActionOptions = {}): Observable<CustomerStrategyAction> {
        return Observable.create((observer: Observer<CustomerStrategyAction>) => {
            const meta = { methodId: options.methodId };

            observer.next(createAction(CustomerStrategyActionType.InitializeRequested, undefined, meta));

            this._strategyRegistry.get(options && options.methodId)
                .initialize(options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.InitializeSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(CustomerStrategyActionType.InitializeFailed, error, meta));
                });
        });
    }

    deinitialize(options: CustomerActionOptions = {}): Observable<CustomerStrategyAction> {
        return Observable.create((observer: Observer<CustomerStrategyAction>) => {
            const meta = { methodId: options.methodId };

            observer.next(createAction(CustomerStrategyActionType.DeinitializeRequested, undefined, meta));

            this._strategyRegistry.get(options && options.methodId)
                .deinitialize(options)
                .then(() => {
                    observer.next(createAction(CustomerStrategyActionType.DeinitializeSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(CustomerStrategyActionType.DeinitializeFailed, error, meta));
                });
        });
    }
}

export interface CustomerActionOptions {
    methodId?: string;
}
