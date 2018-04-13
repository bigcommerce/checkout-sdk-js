import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { getCustomerState, getGuestCustomer } from '../customer/internal-customers.mock';
import { getPaymentMethod } from '../payment/payment-methods.mock';

import createShippingStrategyRegistry from './create-shipping-strategy-registry';
import { getShippingAddress } from './internal-shipping-addresses.mock';
import { getShippingOptions } from './internal-shipping-options.mock';
import ShippingStrategyActionCreator from './shipping-strategy-action-creator';
import { ShippingStrategyActionType } from './shipping-strategy-actions';
import { ShippingStrategy } from './strategies';

describe('ShippingStrategyActionCreator', () => {
    let client: CheckoutClient;
    let registry: Registry<ShippingStrategy>;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore();
        client = createCheckoutClient();
        registry = createShippingStrategyRegistry(store, client);
    });

    describe('#initialize()', () => {
        let strategy: ShippingStrategy;

        beforeEach(() => {
            strategy = registry.get();

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds shipping strategy by id', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';

            jest.spyOn(registry, 'get');

            await Observable.from(actionCreator.initialize({ methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(methodId);
        });

        it('finds remote shipping strategy if available', async () => {
            const customer = { ...getGuestCustomer(), remote: { provider: getPaymentMethod().id } };
            const actionCreator = new ShippingStrategyActionCreator(registry);

            store = createCheckoutStore({
                customer: { ...getCustomerState(), data: customer },
            });

            jest.spyOn(registry, 'get');

            await Observable.from(actionCreator.initialize()(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(customer.remote.provider);
        });

        it('initializes default shipping strategy by default', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const strategy = registry.get();

            await Observable.from(actionCreator.initialize()(store))
                .toPromise();

            expect(strategy.initialize).toHaveBeenCalled();
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';
            const actions = await Observable.from(actionCreator.initialize({ methodId })(store))
                .toArray()
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
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.reject(initializeError));

            const actions = await Observable.from(actionCreator.initialize({ methodId })(store))
                .catch(errorHandler)
                .toArray()
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

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds shipping strategy by id', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';

            jest.spyOn(registry, 'get');

            await Observable.from(actionCreator.deinitialize({ methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(methodId);
        });

        it('deinitializes shipping strategy by default', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);

            await Observable.from(actionCreator.deinitialize()(store))
                .toPromise();

            expect(strategy.deinitialize).toHaveBeenCalled();
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';
            const actions = await Observable.from(actionCreator.deinitialize({ methodId })(store))
                .toArray()
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
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.reject(deinitializeError));

            const actions = await Observable.from(actionCreator.deinitialize({ methodId })(store))
                .catch(errorHandler)
                .toArray()
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

            await Observable.from(actionCreator.updateAddress(getShippingAddress(), { methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('default');
        });

        it('executes shipping strategy', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const options = { methodId: 'default' };
            const address = getShippingAddress();

            await Observable.from(actionCreator.updateAddress(address, options)(store))
                .toPromise();

            expect(strategy.updateAddress).toHaveBeenCalledWith(address, options);
        });

        it('emits action to notify sign-in progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const methodId = 'default';
            const actions = await Observable.from(actionCreator.updateAddress(getShippingAddress(), { methodId })(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: ShippingStrategyActionType.UpdateAddressRequested, meta: { methodId } },
                { type: ShippingStrategyActionType.UpdateAddressSucceeded, meta: { methodId } },
            ]);
        });

        it('emits error action if unable to sign in', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const updateAddressError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'updateAddress')
                .mockReturnValue(Promise.reject(updateAddressError));

            const actions = await Observable.from(actionCreator.updateAddress(getShippingAddress(), { methodId: 'default' })(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ShippingStrategyActionType.UpdateAddressRequested, meta: { methodId: 'default' } },
                { type: ShippingStrategyActionType.UpdateAddressFailed, error: true, payload: updateAddressError, meta: { methodId: 'default' } },
            ]);
        });
    });

    describe('#selectOption()', () => {
        let addressId: string;
        let shippingOptionId: string;
        let strategy: ShippingStrategy;

        beforeEach(() => {
            addressId = 'address-id-12';
            shippingOptionId = 'shipping-option-id-33';
            strategy = registry.get();

            jest.spyOn(strategy, 'selectOption')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds shipping strategy by id', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const address = getShippingAddress();
            const option = getShippingOptions();
            const methodId = 'default';

            jest.spyOn(registry, 'get');

            await Observable.from(actionCreator.selectOption(addressId, shippingOptionId, { methodId })(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith(methodId);
        });

        it('executes shipping strategy by default', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);

            await Observable.from(actionCreator.selectOption(addressId, shippingOptionId)(store))
                .toPromise();

            expect(strategy.selectOption).toHaveBeenCalledWith(addressId, shippingOptionId, { methodId: undefined });
        });

        it('emits action to notify sign-out progress', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const actions = await Observable.from(actionCreator.selectOption(addressId, shippingOptionId, { methodId: 'default' })(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: ShippingStrategyActionType.SelectOptionRequested, meta: { methodId: 'default' } },
                { type: ShippingStrategyActionType.SelectOptionSucceeded, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if unable to sign out', async () => {
            const actionCreator = new ShippingStrategyActionCreator(registry);
            const selectOptionError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'selectOption')
                .mockReturnValue(Promise.reject(selectOptionError));

            const actions = await Observable.from(actionCreator.selectOption(addressId, shippingOptionId, { methodId: 'default' })(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ShippingStrategyActionType.SelectOptionRequested, meta: { methodId: 'default' } },
                { type: ShippingStrategyActionType.SelectOptionFailed, error: true, payload: selectOptionError, meta: { methodId: 'default' } },
            ]);
        });
    });
});
