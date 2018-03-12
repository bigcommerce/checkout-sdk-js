import { DataStore } from '@bigcommerce/data-store';
import { createCheckoutClient, createCheckoutStore, CheckoutSelectors } from '../../checkout';
import { getFlatRateOption } from '../internal-shipping-options.mock';
import { getShippingAddress } from '../internal-shipping-addresses.mock';
import createUpdateShippingService from '../../shipping/create-update-shipping-service';
import DefaultShippingStrategy from './default-shipping-strategy';
import UpdateShippingService from '../update-shipping-service';

describe('DefaultShippingStrategy', () => {
    let store: DataStore<CheckoutSelectors>;
    let updateShippingService: UpdateShippingService;

    beforeEach(() => {
        store = createCheckoutStore();
        updateShippingService = createUpdateShippingService(store, createCheckoutClient());
    });

    it('updates shipping address', async () => {
        const strategy = new DefaultShippingStrategy(store, updateShippingService);
        const address = getShippingAddress();
        const options = {};

        jest.spyOn(updateShippingService, 'updateAddress')
            .mockReturnValue(Promise.resolve(store.getState()));

        const output = await strategy.updateAddress(address, options);

        expect(output).toEqual(store.getState());
        expect(updateShippingService.updateAddress).toHaveBeenCalledWith(address, options);
    });

    it('selects shipping option', async () => {
        const strategy = new DefaultShippingStrategy(store, updateShippingService);
        const address = getShippingAddress();
        const method = getFlatRateOption();
        const options = {};

        jest.spyOn(updateShippingService, 'selectOption')
            .mockReturnValue(Promise.resolve(store.getState()));

        const output = await strategy.selectOption(address.id, method.id, options);

        expect(output).toEqual(store.getState());
        expect(updateShippingService.selectOption).toHaveBeenCalledWith(address.id, method.id, options);
    });
});
