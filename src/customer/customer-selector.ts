import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

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
