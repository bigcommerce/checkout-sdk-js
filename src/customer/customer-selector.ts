import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import Customer from './customer';
import CustomerState, { DEFAULT_STATE } from './customer-state';

export default interface CustomerSelector {
    getCustomer(): Customer | undefined;
}

export type CustomerSelectorFactory = (state: CustomerState) => CustomerSelector;

export function createCustomerSelectorFactory(): CustomerSelectorFactory {
    const getCustomer = createSelector(
        (state: CustomerState) => state.data,
        customer => () => customer
    );

    return memoizeOne((
        state: CustomerState = DEFAULT_STATE
    ): CustomerSelector => {
        return {
            getCustomer: getCustomer(state),
        };
    });
}
