import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';

import { CheckoutClient, CheckoutStore, createCheckoutClient, createCheckoutStore } from '../../checkout';
import { getShippingAddress } from '../internal-shipping-addresses.mock';
import { getFlatRateOption } from '../internal-shipping-options.mock';
import ShippingAddressActionCreator from '../shipping-address-action-creator';
import { UPDATE_SHIPPING_ADDRESS_REQUESTED } from '../shipping-address-action-types';
import ShippingOptionActionCreator from '../shipping-option-action-creator';
import DefaultShippingStrategy from './default-shipping-strategy';
import { SELECT_SHIPPING_OPTION_REQUESTED } from '../shipping-option-action-types';

describe('DefaultShippingStrategy', () => {
    let client: CheckoutClient;
    let store: CheckoutStore;
    let addressActionCreator: ShippingAddressActionCreator;
    let optionActionCreator: ShippingOptionActionCreator;

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        addressActionCreator = new ShippingAddressActionCreator(client);
        optionActionCreator = new ShippingOptionActionCreator(client);
    });

    it('updates shipping address', async () => {
        const strategy = new DefaultShippingStrategy(store, addressActionCreator, optionActionCreator);
        const address = getShippingAddress();
        const options = {};
        const action = Observable.of(createAction(UPDATE_SHIPPING_ADDRESS_REQUESTED));

        jest.spyOn(addressActionCreator, 'updateAddress')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.updateAddress(address, options);

        expect(addressActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('selects shipping option', async () => {
        const strategy = new DefaultShippingStrategy(store, addressActionCreator, optionActionCreator);
        const address = getShippingAddress();
        const method = getFlatRateOption();
        const options = {};
        const action = Observable.of(createAction(SELECT_SHIPPING_OPTION_REQUESTED));

        jest.spyOn(optionActionCreator, 'selectShippingOption')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(address.id, method.id, options);

        expect(optionActionCreator.selectShippingOption).toHaveBeenCalledWith(address.id, method.id, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
