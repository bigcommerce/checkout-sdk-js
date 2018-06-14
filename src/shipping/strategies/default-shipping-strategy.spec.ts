import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import ConsignmentActionCreator from '../consignment-action-creator';
import { ConsignmentActionType } from '../consignment-actions';
import { getFlatRateOption } from '../internal-shipping-options.mock';
import { getShippingAddress } from '../shipping-addresses.mock';

import DefaultShippingStrategy from './default-shipping-strategy';

describe('DefaultShippingStrategy', () => {
    let client: CheckoutClient;
    let store: CheckoutStore;
    let consignmentActionCreator: ConsignmentActionCreator;

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        consignmentActionCreator = new ConsignmentActionCreator(client);
    });

    it('updates shipping address', async () => {
        const strategy = new DefaultShippingStrategy(store, consignmentActionCreator);
        const address = getShippingAddress();
        const options = {};
        const action = Observable.of(createAction(ConsignmentActionType.CreateConsignmentsRequested));

        jest.spyOn(consignmentActionCreator, 'updateAddress')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.updateAddress(address, options);

        expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('selects shipping option', async () => {
        const strategy = new DefaultShippingStrategy(store, consignmentActionCreator);
        const address = getShippingAddress();
        const method = getFlatRateOption();
        const options = {};
        const action = Observable.of(createAction(ConsignmentActionType.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'selectShippingOption')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(method.id, options);

        expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(method.id, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
