import { CheckoutSelectors } from '../../checkout';
import { DataStore } from '../../../data-store';
import createCheckoutClient from '../../create-checkout-client';
import createCheckoutStore from '../../create-checkout-store';
import createUpdateShippingService from '../../create-update-shipping-service';
import ShippingStrategy from './default-shipping-strategy';
import UpdateShippingService from '../update-shipping-service';

describe('ShippingStrategy', () => {
    let store: DataStore<CheckoutSelectors>;
    let updateShippingService: UpdateShippingService;

    class FoobarShippingStrategy extends ShippingStrategy {}

    beforeEach(() => {
        store = createCheckoutStore();
        updateShippingService = createUpdateShippingService(store, createCheckoutClient());
    });

    it('returns checkout state after initialization', async () => {
        const strategy = new FoobarShippingStrategy(store, updateShippingService);
        const state = await strategy.initialize();

        expect(state).toEqual(store.getState());
    });

    it('returns checkout state after deinitialization', async () => {
        const strategy = new FoobarShippingStrategy(store, updateShippingService);
        const state = await strategy.deinitialize();

        expect(state).toEqual(store.getState());
    });

    it('throws error', async () => {
        const strategy = new FoobarShippingStrategy(store, updateShippingService);

        expect(() => strategy.updateAddress(getShippingAddress())).toThrow();
    });
});
