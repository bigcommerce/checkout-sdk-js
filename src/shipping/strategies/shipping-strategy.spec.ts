import { DataStore } from '@bigcommerce/data-store';

import { Address } from '../../address';
import { createCheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { ShippingRequestOptions } from '../shipping-request-options';

import ShippingStrategy from './shipping-strategy';

describe('ShippingStrategy', () => {
    let store: DataStore<InternalCheckoutSelectors>;

    class FoobarShippingStrategy extends ShippingStrategy {
        updateAddress(address: Address, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(store.getState());
        }

        selectOption(optionId: string, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(store.getState());
        }
    }

    beforeEach(() => {
        store = createCheckoutStore();
    });

    it('returns checkout state after initialization', async () => {
        const strategy = new FoobarShippingStrategy(store);
        const state = await strategy.initialize();

        expect(state).toEqual(store.getState());
    });

    it('returns checkout state after deinitialization', async () => {
        const strategy = new FoobarShippingStrategy(store);
        const state = await strategy.deinitialize();

        expect(state).toEqual(store.getState());
    });
});
