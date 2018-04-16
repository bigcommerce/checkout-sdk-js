import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import ConsignmentActionCreator from '../consignment-action-creator';
import { ConsignmentActionTypes } from '../consignment-actions';
import { getFlatRateOption } from '../internal-shipping-options.mock';
import { getShippingAddress } from '../shipping-addresses.mock';
import ShippingOptionActionCreator from '../shipping-option-action-creator';
import { SELECT_SHIPPING_OPTION_REQUESTED } from '../shipping-option-action-types';

import DefaultShippingStrategy from './default-shipping-strategy';

describe('DefaultShippingStrategy', () => {
    let client: CheckoutClient;
    let store: CheckoutStore;
    let consignmentActionCreator: ConsignmentActionCreator;
    let optionActionCreator: ShippingOptionActionCreator;

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        consignmentActionCreator = new ConsignmentActionCreator(client);
        optionActionCreator = new ShippingOptionActionCreator(client);
    });

    it('updates shipping address', async () => {
        const strategy = new DefaultShippingStrategy(store, consignmentActionCreator, optionActionCreator);
        const address = getShippingAddress();
        const options = {};
        const action = Observable.of(createAction(ConsignmentActionTypes.CreateConsignmentsRequested));

        jest.spyOn(consignmentActionCreator, 'updateAddress')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.updateAddress(address, options);

        expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('selects shipping option', async () => {
        const strategy = new DefaultShippingStrategy(store, consignmentActionCreator, optionActionCreator);
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
