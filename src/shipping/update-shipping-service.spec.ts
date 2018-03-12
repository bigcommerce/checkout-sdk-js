import { Observable } from 'rxjs';
import { createAction } from '@bigcommerce/data-store';
import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../checkout';
import { getFlatRateOption } from './internal-shipping-options.mock';
import { getShippingAddress } from './internal-shipping-addresses.mock';
import * as addressActionTypes from './shipping-address-action-types';
import * as optionActionTypes from './shipping-option-action-types';
import ShippingActionCreator from './shipping-action-creator';
import ShippingAddressActionCreator from './shipping-address-action-creator';
import ShippingOptionActionCreator from './shipping-option-action-creator';
import UpdateShippingService from './update-shipping-service';

describe('UpdateShippingService', () => {
    let addressActionCreator: ShippingAddressActionCreator;
    let optionActionCreator: ShippingOptionActionCreator;
    let shippingActionCreator: ShippingActionCreator;
    let store: CheckoutStore;

    beforeEach(() => {
        addressActionCreator = new ShippingAddressActionCreator(createCheckoutClient());
        optionActionCreator = new ShippingOptionActionCreator(createCheckoutClient());
        shippingActionCreator = new ShippingActionCreator();
        store = createCheckoutStore();
    });

    it('dispatches action to update shipping address', async () => {
        const service = new UpdateShippingService(store, addressActionCreator, optionActionCreator, shippingActionCreator);
        const address = getShippingAddress();
        const options = {};
        const action = Observable.of(createAction(addressActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED));

        jest.spyOn(addressActionCreator, 'updateAddress').mockReturnValue(action);
        jest.spyOn(store, 'dispatch');

        const output = await service.updateAddress(address, options);

        expect(addressActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('dispatches action to select shipping option', async () => {
        const service = new UpdateShippingService(store, addressActionCreator, optionActionCreator, shippingActionCreator);
        const address = getShippingAddress();
        const shippingOption = getFlatRateOption();
        const options = {};
        const action = Observable.of(createAction(optionActionTypes.SELECT_SHIPPING_OPTION_REQUESTED));

        jest.spyOn(optionActionCreator, 'selectShippingOption').mockReturnValue(action);
        jest.spyOn(store, 'dispatch');

        const output = await service.selectOption(address.id, shippingOption.id, options);

        expect(optionActionCreator.selectShippingOption).toHaveBeenCalledWith(address.id, shippingOption.id, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
