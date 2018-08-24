import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
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

        store = createCheckoutStore();
        registry = createCustomerStrategyRegistry(store);
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
            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds customer strategy by id', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);

            await actionCreator.initialize({ methodId: 'default' })
                .toArray()
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const options = { methodId: 'default' };

            await actionCreator.initialize(options)
                .toArray()
                .toPromise();

            expect(strategy.initialize).toHaveBeenCalledWith(options);
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.initialize({ methodId: 'default' })
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.InitializeRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.InitializeSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to initialize', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const initializeError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.reject(initializeError));

            const actions = await actionCreator.initialize({ methodId: 'default' })
                .catch(errorHandler)
                .toArray()
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
            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds customer strategy by id', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);

            await actionCreator.deinitialize({ methodId: 'default' })
                .toArray()
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const options = { methodId: 'default' };

            await actionCreator.deinitialize(options)
                .toArray()
                .toPromise();

            expect(strategy.deinitialize).toHaveBeenCalledWith(options);
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.deinitialize({ methodId: 'default' })
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.DeinitializeRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.DeinitializeSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to deinitialize', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const deinitializeError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.reject(deinitializeError));

            const actions = await actionCreator.deinitialize({ methodId: 'default' })
                .catch(errorHandler)
                .toArray()
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
                .toArray()
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const credentials = { email: 'foo@bar.com', password: 'password1' };
            const options = { methodId: 'default' };

            await actionCreator.signIn(credentials, options)
                .toArray()
                .toPromise();

            expect(strategy.signIn).toHaveBeenCalledWith(credentials, options);
        });

        it('emits action to notify sign-in progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.signIn({ email: 'foo@bar.com', password: 'password1' }, { methodId: 'default' })
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.SignInRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.SignInSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to sign in', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const signInError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'signIn')
                .mockReturnValue(Promise.reject(signInError));

            const actions = await actionCreator.signIn({ email: 'foo@bar.com', password: 'password1' }, { methodId: 'default' })
                .catch(errorHandler)
                .toArray()
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
                .toArray()
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes customer strategy', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const options = { methodId: 'default' };

            await actionCreator.signOut(options)
                .toArray()
                .toPromise();

            expect(strategy.signOut).toHaveBeenCalledWith(options);
        });

        it('emits action to notify sign-out progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.signOut({ methodId: 'default' })
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.SignOutRequested, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.SignOutSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to sign out', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const signOutError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'signOut')
                .mockReturnValue(Promise.reject(signOutError));

            const actions = await actionCreator.signOut({ methodId: 'default' })
                .catch(errorHandler)
                .toArray()
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
                .toArray()
                .toPromise();

            expect(fakeMethod).toHaveBeenCalled();
        });

        it('emits action to notify widget interaction in progress', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const actions = await actionCreator.widgetInteraction(jest.fn(() => Promise.resolve()), { methodId: 'default' })
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerStrategyActionType.WidgetInteractionStarted, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.WidgetInteractionFinished, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if widget interaction fails', async () => {
            const actionCreator = new CustomerStrategyActionCreator(registry);
            const signInError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            const actions = await actionCreator.widgetInteraction(jest.fn(() => Promise.reject(signInError)), { methodId: 'default' })
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerStrategyActionType.WidgetInteractionStarted, meta: { methodId: 'default' } },
                { type: CustomerStrategyActionType.WidgetInteractionFailed, error: true, payload: signInError, meta: { methodId: 'default' } },
            ]);
        });
    });
});
