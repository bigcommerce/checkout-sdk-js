import { DataStore } from '@bigcommerce/data-store';
import { Address } from '../../address';
import { CheckoutSelectors } from '../../checkout';
import createCheckoutClient from '../../create-checkout-client';
import createCheckoutStore from '../../create-checkout-store';
import createUpdateShippingService from '../../shipping/create-update-shipping-service';
import ShippingStrategy from './shipping-strategy';
import UpdateShippingService from '../update-shipping-service';

describe('ShippingStrategy', () => {
    let store: DataStore<CheckoutSelectors>;
    let updateShippingService: UpdateShippingService;

    class FoobarShippingStrategy extends ShippingStrategy {
        updateAddress(address: Address, options?: any): Promise<CheckoutSelectors> {
            return Promise.resolve(store.getState());
        }

        selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
            return Promise.resolve(store.getState());
        }
    }

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
});
