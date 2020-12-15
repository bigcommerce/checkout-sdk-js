import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import Customer from './customer';
import CustomerState, { DEFAULT_STATE } from './customer-state';

export default interface CustomerSelector {
    getCustomer(): Customer | undefined;
    getCreateAccountError(): Error | undefined;
    isCreatingCustomerAccount(): boolean;
}

export type CustomerSelectorFactory = (state: CustomerState) => CustomerSelector;

export function createCustomerSelectorFactory(): CustomerSelectorFactory {
    const getCustomer = createSelector(
        (state: CustomerState) => state.data,
        customer => () => customer
    );

    const getCreateAccountError = createSelector(
        (state: CustomerState) => state.errors.createError,
        error => () => error
    );

    const isCreatingCustomerAccount = createSelector(
        (state: CustomerState) => !!state.statuses.isCreating,
        status => () => status
    );

    return memoizeOne((
        state: CustomerState = DEFAULT_STATE
    ): CustomerSelector => {
        return {
            getCustomer: getCustomer(state),
            getCreateAccountError: getCreateAccountError(state),
            isCreatingCustomerAccount: isCreatingCustomerAccount(state),
        };
    });
}
