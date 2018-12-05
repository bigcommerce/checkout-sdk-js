import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckoutState, getCheckoutStoreState, getCheckoutWithPayments } from '../checkout/checkouts.mock';
import { Registry } from '../common/registry';
import { getPaymentMethod } from '../payment/payment-methods.mock';

import createShippingStrategyRegistry from './create-shipping-strategy-registry';
import { getShippingAddress } from './shipping-addresses.mock';
import ShippingStrategyActionCreator from './shipping-strategy-action-creator';
import { ShippingStrategyActionType } from './shipping-strategy-actions';
import { ShippingStrategy } from './strategies';

describe('ShippingStrategyActionCreator', () => {
    let registry: Registry<ShippingStrategy>;
    let requestSender: RequestSender;
    let state: CheckoutStoreState;
    let store: CheckoutStore;

    beforeEach(() => {
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        requestSender = createRequestSender();
        registry = createShippingStrategyRegistry(store, requestSender);
    });

    describe('#initialize()', () => {
        let strategy: ShippingStrategy;

        beforeEach(() => {
            strategy = registry.get();
            store = createCheckoutStore(merge({}, state, {
                shippingStrategies: { data: { amazon: { isInitialized: true } } },
            }));

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds shipping strategy by id', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';

            jest.spyOn(registry, 'get');

            await from(actionCreator.initialize({ methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(methodId);
        });

        it('finds remote shipping strategy if available', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = getPaymentMethod().id;

            store = createCheckoutStore({
                ...state,
                checkout: { ...getCheckoutState(), data: getCheckoutWithPayments() },
            });

            jest.spyOn(registry, 'get');

            await from(actionCreator.initialize()(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(methodId);
        });

        it('initializes default shipping strategy by default', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const strategy = registry.get();

            await from(actionCreator.initialize()(store))
                .toPromise();

            expect(strategy.initialize).toHaveBeenCalled();
        });

        it('does not initialize if strategy is already initialized', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const strategy = registry.get('amazon');

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.resolve(store.getState()));

            await from(actionCreator.initialize({ methodId: 'amazon' })(store))
                .toPromise();

            expect(strategy.initialize).not.toHaveBeenCalled();
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';
            const actions = await from(actionCreator.initialize({ methodId })(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ShippingStrategyActionType.InitializeRequested, meta: { methodId } },
                { type: ShippingStrategyActionType.InitializeSucceeded, meta: { methodId } },
            ]);
        });

        it('emits error action if unable to initialize', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const initializeError = new Error();
            const methodId = 'default';
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.reject(initializeError));

            const actions = await from(actionCreator.initialize({ methodId })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ShippingStrategyActionType.InitializeRequested, meta: { methodId } },
                { type: ShippingStrategyActionType.InitializeFailed, error: true, payload: initializeError, meta: { methodId } },
            ]);
        });
    });

    describe('#deinitialize()', () => {
        let strategy: ShippingStrategy;

        beforeEach(() => {
            strategy = registry.get();
            store = createCheckoutStore(merge({}, state, {
                shippingStrategies: { data: { default: { isInitialized: true } } },
            }));

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds shipping strategy by id', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';

            jest.spyOn(registry, 'get');

            await from(actionCreator.deinitialize({ methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(methodId);
        });

        it('deinitializes shipping strategy by default', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);

            await from(actionCreator.deinitialize()(store))
                .toPromise();

            expect(strategy.deinitialize).toHaveBeenCalled();
        });

        it('does not deinitialize if strategy is not initialized', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const strategy = registry.get('amazon');

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.resolve(store.getState()));

            await from(actionCreator.deinitialize({ methodId: 'amazon' })(store))
                .toPromise();

            expect(strategy.deinitialize).not.toHaveBeenCalled();
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';
            const actions = await from(actionCreator.deinitialize({ methodId })(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ShippingStrategyActionType.DeinitializeRequested, meta: { methodId } },
                { type: ShippingStrategyActionType.DeinitializeSucceeded, meta: { methodId } },
            ]);
        });

        it('emits error action if unable to deinitialize', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const deinitializeError = new Error();
            const methodId = 'default';
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.reject(deinitializeError));

            const actions = await from(actionCreator.deinitialize({ methodId })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ShippingStrategyActionType.DeinitializeRequested, meta: { methodId } },
                { type: ShippingStrategyActionType.DeinitializeFailed, error: true, payload: deinitializeError, meta: { methodId } },
            ]);
        });
    });

    describe('#updateAddress()', () => {
        let strategy: ShippingStrategy;

        beforeEach(() => {
            strategy = registry.get();

            jest.spyOn(strategy, 'updateAddress')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds shipping strategy by id', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';

            jest.spyOn(registry, 'get');

            await from(actionCreator.updateAddress(getShippingAddress(), { methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes shipping strategy', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const options = { methodId: 'default' };
            const address = getShippingAddress();

            await from(actionCreator.updateAddress(address, options)(store))
                .toPromise();

            expect(strategy.updateAddress).toHaveBeenCalledWith(address, options);
        });

        it('emits action to notify sign-in progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';
            const actions = await from(actionCreator.updateAddress(getShippingAddress(), { methodId })(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ShippingStrategyActionType.UpdateAddressRequested, meta: { methodId } },
                { type: ShippingStrategyActionType.UpdateAddressSucceeded, meta: { methodId } },
            ]);
        });

        it('emits error action if unable to sign in', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const updateAddressError = new Error();
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'updateAddress')
                .mockReturnValue(Promise.reject(updateAddressError));

            const actions = await from(actionCreator.updateAddress(getShippingAddress(), { methodId: 'default' })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ShippingStrategyActionType.UpdateAddressRequested, meta: { methodId: 'default' } },
                { type: ShippingStrategyActionType.UpdateAddressFailed, error: true, payload: updateAddressError, meta: { methodId: 'default' } },
            ]);
        });
    });

    describe('#selectOption()', () => {
        let shippingOptionId: string;
        let strategy: ShippingStrategy;

        beforeEach(() => {
            shippingOptionId = 'shipping-option-id-33';
            strategy = registry.get();

            jest.spyOn(strategy, 'selectOption')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds shipping strategy by id', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';

            jest.spyOn(registry, 'get');

            await from(actionCreator.selectOption(shippingOptionId, { methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(methodId);
        });

        it('executes shipping strategy by default', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);

            await from(actionCreator.selectOption(shippingOptionId)(store))
                .toPromise();

            expect(strategy.selectOption).toHaveBeenCalledWith(shippingOptionId, { methodId: undefined });
        });

        it('emits action to notify sign-out progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const actions = await from(actionCreator.selectOption(shippingOptionId, { methodId: 'default' })(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ShippingStrategyActionType.SelectOptionRequested, meta: { methodId: 'default' } },
                { type: ShippingStrategyActionType.SelectOptionSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to sign out', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const selectOptionError = new Error();
            const errorHandler = jest.fn(action => of(action));

            jest.spyOn(strategy, 'selectOption')
                .mockReturnValue(Promise.reject(selectOptionError));

            const actions = await from(actionCreator.selectOption(shippingOptionId, { methodId: 'default' })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ShippingStrategyActionType.SelectOptionRequested, meta: { methodId: 'default' } },
                { type: ShippingStrategyActionType.SelectOptionFailed, error: true, payload: selectOptionError, meta: { methodId: 'default' } },
            ]);
        });
    });
});
