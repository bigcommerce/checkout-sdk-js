import { createAction } from '@bigcommerce/data-store';

import { OrderActionType } from '../order';
import { getOrder } from '../order/orders.mock';

import orderBillingAddressReducer from './order-billing-address-reducer';

import { OrderBillingAddressState } from '.';

describe('orderBillingAddressReducer', () => {
    let initialState: OrderBillingAddressState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns billing address when order loads', () => {
        const action = createAction(OrderActionType.LoadOrderSucceeded, getOrder());
        const output = orderBillingAddressReducer(initialState, action);

        expect(output).toEqual({
            data: action.payload && action.payload.billingAddress,
        });
    });
});
