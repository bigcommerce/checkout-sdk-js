import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import Customer from './customer';
import CustomerState, { DEFAULT_STATE } from './customer-state';

export default interface CustomerSelector {
    getCustomer(): Customer | undefined;
    getCustomerOrThrow(): Customer;
    getCreateAccountError(): Error | undefined;
    isCreatingCustomerAccount(): boolean;
    getCreateAddressError(): Error | undefined;
    isCreatingCustomerAddress(): boolean;
}

export type CustomerSelectorFactory = (state: CustomerState) => CustomerSelector;

export function createCustomerSelectorFactory(): CustomerSelectorFactory {
    const getCustomer = createSelector(
        (state: CustomerState) => state.data,
        customer => () => customer
    );

    const getCustomerOrThrow = createSelector(
        getCustomer,
        getCustomer => () => {
            return guard(getCustomer(), () => new MissingDataError(MissingDataErrorType.MissingCustomer));
        }
    );

    const getCreateAccountError = createSelector(
        (state: CustomerState) => state.errors.createError,
        error => () => error
    );

    const isCreatingCustomerAccount = createSelector(
        (state: CustomerState) => !!state.statuses.isCreating,
        status => () => status
    );

    const getCreateAddressError = createSelector(
        (state: CustomerState) => state.errors.createAddressError,
        error => () => error
    );

    const isCreatingCustomerAddress = createSelector(
        (state: CustomerState) => !!state.statuses.isCreatingAddress,
        status => () => status
    );

    return memoizeOne((
        state: CustomerState = DEFAULT_STATE
    ): CustomerSelector => {
        return {
            getCustomer: getCustomer(state),
            getCustomerOrThrow: getCustomerOrThrow(state),
            getCreateAccountError: getCreateAccountError(state),
            isCreatingCustomerAccount: isCreatingCustomerAccount(state),
            getCreateAddressError: getCreateAddressError(state),
            isCreatingCustomerAddress: isCreatingCustomerAddress(state),
        };
    });
}
