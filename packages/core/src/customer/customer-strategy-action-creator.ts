import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import {
    CustomerStrategy as CustomerStrategyV2,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

import { InternalCheckoutSelectors } from '../checkout';
import { ErrorLogger } from '../common/error';
import { Registry } from '../common/registry';
import { matchExistingIntegrations, registerIntegrations } from '../payment-integration';

import CustomerCredentials from './customer-credentials';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from './customer-request-options';
import {
    CustomerStrategyActionType,
    CustomerStrategyDeinitializeAction,
    CustomerStrategyExecutePaymentMethodCheckoutAction,
    CustomerStrategyInitializeAction,
    CustomerStrategySignInAction,
    CustomerStrategySignOutAction,
    CustomerStrategyWidgetAction,
} from './customer-strategy-actions';
import CustomerStrategyRegistryV2 from './customer-strategy-registry-v2';
import { CustomerStrategy } from './strategies';

export default class CustomerStrategyActionCreator {
    constructor(
        private _strategyRegistry: Registry<CustomerStrategy>,
        private _strategyRegistryV2: CustomerStrategyRegistryV2,
        private _paymentIntegrationService: PaymentIntegrationService,
        private _errorLogger: ErrorLogger,
    ) {}

    signIn(
        credentials: CustomerCredentials,
        options?: CustomerRequestOptions,
    ): Observable<CustomerStrategySignInAction> {
        return Observable.create((observer: Observer<CustomerStrategySignInAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(
                createAction(CustomerStrategyActionType.SignInRequested, undefined, meta),
            );

            const promise: Promise<InternalCheckoutSelectors | void> = this._getStrategy(
                methodId,
            ).signIn(credentials, options);

            promise
                .then(() => {
                    observer.next(
                        createAction(CustomerStrategyActionType.SignInSucceeded, undefined, meta),
                    );
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(
                        createErrorAction(CustomerStrategyActionType.SignInFailed, error, meta),
                    );
                });
        });
    }

    signOut(options?: CustomerRequestOptions): Observable<CustomerStrategySignOutAction> {
        return Observable.create((observer: Observer<CustomerStrategySignOutAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(
                createAction(CustomerStrategyActionType.SignOutRequested, undefined, meta),
            );

            const promise: Promise<InternalCheckoutSelectors | void> =
                this._getStrategy(methodId).signOut(options);

            promise
                .then(() => {
                    observer.next(
                        createAction(CustomerStrategyActionType.SignOutSucceeded, undefined, meta),
                    );
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(
                        createErrorAction(CustomerStrategyActionType.SignOutFailed, error, meta),
                    );
                });
        });
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Observable<CustomerStrategyExecutePaymentMethodCheckoutAction> {
        return Observable.create(
            (observer: Observer<CustomerStrategyExecutePaymentMethodCheckoutAction>) => {
                const methodId = options && options.methodId;
                const meta = { methodId };

                observer.next(
                    createAction(
                        CustomerStrategyActionType.ExecutePaymentMethodCheckoutRequested,
                        undefined,
                        meta,
                    ),
                );

                const promise: Promise<InternalCheckoutSelectors | void> =
                    this._getStrategy(methodId).executePaymentMethodCheckout(options);

                promise
                    .then(() => {
                        observer.next(
                            createAction(
                                CustomerStrategyActionType.ExecutePaymentMethodCheckoutSucceeded,
                                undefined,
                                meta,
                            ),
                        );
                        observer.complete();
                    })
                    .catch((error) => {
                        observer.error(
                            createErrorAction(
                                CustomerStrategyActionType.ExecutePaymentMethodCheckoutFailed,
                                error,
                                meta,
                            ),
                        );
                    });
            },
        );
    }

    initialize(
        options?: CustomerInitializeOptions,
    ): ThunkAction<CustomerStrategyInitializeAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<CustomerStrategyInitializeAction>) => {
                const state = store.getState();
                const methodId = options && options.methodId;
                const meta = { methodId };

                const { features } = state.config.getStoreConfigOrThrow().checkoutSettings;
                const experimentEnabled = isExperimentEnabled(
                    features,
                    'CHECKOUT-9450.lazy_load_payment_strategies',
                    false,
                );

                if (experimentEnabled) {
                    const resolveId = { id: methodId || '' };

                    matchExistingIntegrations(
                        this._strategyRegistryV2,
                        options?.integrations ?? [],
                        resolveId,
                        this._errorLogger,
                        this._paymentIntegrationService,
                    );
                    registerIntegrations(
                        this._strategyRegistryV2,
                        options?.integrations ?? [],
                        this._paymentIntegrationService,
                    );
                }

                if (methodId && state.customerStrategies.isInitialized(methodId)) {
                    return observer.complete();
                }

                observer.next(
                    createAction(CustomerStrategyActionType.InitializeRequested, undefined, meta),
                );

                const promise: Promise<InternalCheckoutSelectors | void> =
                    this._getStrategy(methodId).initialize(options);

                promise
                    .then(() => {
                        observer.next(
                            createAction(
                                CustomerStrategyActionType.InitializeSucceeded,
                                undefined,
                                meta,
                            ),
                        );
                        observer.complete();
                    })
                    .catch((error) => {
                        observer.error(
                            createErrorAction(
                                CustomerStrategyActionType.InitializeFailed,
                                error,
                                meta,
                            ),
                        );
                    });
            });
    }

    deinitialize(
        options?: CustomerRequestOptions,
    ): ThunkAction<CustomerStrategyDeinitializeAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<CustomerStrategyDeinitializeAction>) => {
                const state = store.getState();
                const methodId = options && options.methodId;
                const meta = { methodId };

                if (methodId && !state.customerStrategies.isInitialized(methodId)) {
                    return observer.complete();
                }

                observer.next(
                    createAction(CustomerStrategyActionType.DeinitializeRequested, undefined, meta),
                );

                const promise: Promise<InternalCheckoutSelectors | void> =
                    this._getStrategy(methodId).deinitialize(options);

                promise
                    .then(() => {
                        observer.next(
                            createAction(
                                CustomerStrategyActionType.DeinitializeSucceeded,
                                undefined,
                                meta,
                            ),
                        );
                        observer.complete();
                    })
                    .catch((error) => {
                        observer.error(
                            createErrorAction(
                                CustomerStrategyActionType.DeinitializeFailed,
                                error,
                                meta,
                            ),
                        );
                    });
            });
    }

    widgetInteraction(
        method: () => Promise<any>,
        options?: CustomerRequestOptions,
    ): Observable<CustomerStrategyWidgetAction> {
        return Observable.create((observer: Observer<CustomerStrategyWidgetAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(
                createAction(CustomerStrategyActionType.WidgetInteractionStarted, undefined, meta),
            );

            method()
                .then(() => {
                    observer.next(
                        createAction(
                            CustomerStrategyActionType.WidgetInteractionFinished,
                            undefined,
                            meta,
                        ),
                    );
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(
                        createErrorAction(
                            CustomerStrategyActionType.WidgetInteractionFailed,
                            error,
                            meta,
                        ),
                    );
                });
        });
    }

    private _getStrategy(methodId?: string): CustomerStrategy | CustomerStrategyV2 {
        let strategy: CustomerStrategy | CustomerStrategyV2;

        try {
            strategy = this._strategyRegistryV2.get({ id: methodId || '' });
        } catch {
            strategy = this._strategyRegistry.get(methodId);
        }

        return strategy;
    }
}
