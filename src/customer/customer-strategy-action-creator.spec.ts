import { createRequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';

import createCustomerStrategyRegistry from './create-customer-strategy-registry';
import CustomerActionCreator from './customer-action-creator';
import CustomerRequestSender from './customer-request-sender';
import CustomerStrategyActionCreator from './customer-strategy-action-creator';
import { CustomerStrategyActionType } from './customer-strategy-actions';
import { CustomerStrategy, DefaultCustomerStrategy } from './strategies';

describe('CustomerStrategyActionCreator', () => {
    let registry: Registry<CustomerStrategy>;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let strategy: DefaultCustomerStrategy;

    beforeEach(() => {
        const requestSender = createRequestSender();
        const checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(
                new ConfigRequestSender(requestSender)
            )
        );

        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        registry = createCustomerStrategyRegistry(store, createRequestSender());
        strategy = new DefaultCustomerStrategy(
            store,
            new CustomerActionCreator(
                new CustomerRequestSender(requestSender),
                checkoutActionCreator
            )
        );

        jest.spyOn(registry, 'get')
            .mockReturnValue(strategy);

        jest.spyOn(strategy, 'signOut')
            .mockReturnValue(Promise.resolve(store.getState()));
    });

    describe('#initialize()', () => {
        beforeEach(() => {
            store = createCheckoutStore(merge({}, state, {
                customerStrategies: { data: { amazon: { isInitialized: true } } },
            }));

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds customer strategy by id', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);

            await from(actionCreator.initialize({ methodId: 'default' })(store))
                .pipe(toArray())
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('initializes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const options = { methodId: 'default' };

            await from(actionCreator.initialize(options)(store))
                .pipe(toArray())
                .toPromise();

            expect(strategy.initialize).toHaveBeenCalledWith(options);
        });

        it('does not initialize if strategy is already initialized', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const strategy = registry.get('amazon');

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.resolve(store.getState()));

            await from(actionCreator.initialize({ methodId: 'amazon' })(store))
                .toPromise();

            expect(strategy.initialize).not.toHaveBeenCalled();
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await from(actionCreator.initialize({ methodId: 'default' })(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.InitializeRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.InitializeSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to initialize', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const initializeError = new Error();
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.reject(initializeError));

            const actions = await from(actionCreator.initialize({ methodId: 'default' })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerStrategyActionType.InitializeRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.InitializeFailed, error: true, payload: initializeError, meta: { methodId: 'default' } },
            ]);
        });
    });

    describe('#deinitialize()', () => {
        beforeEach(() => {
            store = createCheckoutStore(merge({}, state, {
                customerStrategies: { data: { default: { isInitialized: true } } },
            }));

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds customer strategy by id', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);

            await from(actionCreator.deinitialize({ methodId: 'default' })(store))
                .pipe(toArray())
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('deinitializes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const options = { methodId: 'default' };

            await from(actionCreator.deinitialize(options)(store))
                .pipe(toArray())
                .toPromise();

            expect(strategy.deinitialize).toHaveBeenCalledWith(options);
        });

        it('does not deinitialize if strategy is not initialized', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const strategy = registry.get('amazon');

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.resolve(store.getState()));

            await from(actionCreator.deinitialize({ methodId: 'amazon' })(store))
                .toPromise();

            expect(strategy.deinitialize).not.toHaveBeenCalled();
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await from(actionCreator.deinitialize({ methodId: 'default' })(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.DeinitializeRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.DeinitializeSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to deinitialize', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const deinitializeError = new Error();
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.reject(deinitializeError));

            const actions = await from(actionCreator.deinitialize({ methodId: 'default' })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerStrategyActionType.DeinitializeRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.DeinitializeFailed, error: true, payload: deinitializeError, meta: { methodId: 'default' } },
            ]);
        });
    });

    describe('#signIn()', () => {
        beforeEach(() => {
            jest.spyOn(strategy, 'signIn')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds customer strategy by id', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);

            await actionCreator.signIn({ email: 'foo@bar.com', password: 'password1' }, { methodId: 'default' })
                .pipe(toArray())
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const credentials = { email: 'foo@bar.com', password: 'password1' };
            const options = { methodId: 'default' };

            await actionCreator.signIn(credentials, options)
                .pipe(toArray())
                .toPromise();

            expect(strategy.signIn).toHaveBeenCalledWith(credentials, options);
        });

        it('emits action to notify sign-in progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.signIn({ email: 'foo@bar.com', password: 'password1' }, { methodId: 'default' })
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.SignInRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.SignInSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to sign in', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const signInError = new Error();
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'signIn')
                .mockReturnValue(Promise.reject(signInError));

            const actions = await actionCreator.signIn({ email: 'foo@bar.com', password: 'password1' }, { methodId: 'default' })
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerStrategyActionType.SignInRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.SignInFailed, error: true, payload: signInError, meta: { methodId: 'default' } },
            ]);
        });
    });

    describe('#signOut()', () => {
        beforeEach(() => {
            jest.spyOn(strategy, 'signOut')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds customer strategy by id', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);

            await actionCreator.signOut({ methodId: 'default' })
                .pipe(toArray())
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const options = { methodId: 'default' };

            await actionCreator.signOut(options)
                .pipe(toArray())
                .toPromise();

            expect(strategy.signOut).toHaveBeenCalledWith(options);
        });

        it('emits action to notify sign-out progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.signOut({ methodId: 'default' })
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.SignOutRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.SignOutSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to sign out', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const signOutError = new Error();
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'signOut')
                .mockReturnValue(Promise.reject(signOutError));

            const actions = await actionCreator.signOut({ methodId: 'default' })
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerStrategyActionType.SignOutRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.SignOutFailed, error: true, payload: signOutError, meta: { methodId: 'default' } },
            ]);
        });
    });

    describe('#widgetInteraction()', () => {
        it('executes widget interaction callback', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const options = { methodId: 'default' };
            const fakeMethod = jest.fn(() => Promise.resolve());
            await actionCreator.widgetInteraction(fakeMethod, options)
                .pipe(toArray())
                .toPromise();

            expect(fakeMethod).toHaveBeenCalled();
        });

        it('emits action to notify widget interaction in progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.widgetInteraction(jest.fn(() => Promise.resolve()), { methodId: 'default' })
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.WidgetInteractionStarted, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.WidgetInteractionFinished, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if widget interaction fails', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const signInError = new Error();
            const errorHandler = jest.fn(action => of(action));

            const actions = await actionCreator.widgetInteraction(jest.fn(() => Promise.reject(signInError)), { methodId: 'default' })
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerStrategyActionType.WidgetInteractionStarted, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.WidgetInteractionFailed, error: true, payload: signInError, meta: { methodId: 'default' } },
            ]);
        });
    });
});
