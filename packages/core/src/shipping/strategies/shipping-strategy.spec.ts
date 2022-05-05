import { createCheckoutStore, CheckoutStore, InternalCheckoutSelectors } from '../../checkout';

import ShippingStrategy from './shipping-strategy';

describe('ShippingStrategy', () => {
    let store: CheckoutStore;

    class FoobarShippingStrategy implements ShippingStrategy {
        constructor(
            private _store: CheckoutStore
        ) {}

        updateAddress(): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }

        selectOption(): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }

        initialize(): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }

        deinitialize(): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
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
