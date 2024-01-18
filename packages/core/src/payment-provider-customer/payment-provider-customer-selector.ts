import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import PaymentProviderCustomerState, { DEFAULT_STATE } from './payment-provider-customer-state';
import { PaymentProviderCustomer } from './payment-provider-customer';

export default interface PaymentProviderCustomerSelector {
    getPaymentProviderCustomer(): PaymentProviderCustomer | undefined;
    getPaymentProviderCustomerOrThrow(): PaymentProviderCustomer;
}

export type PaymentProviderCustomerSelectorFactory = (
    state: PaymentProviderCustomerState,
) => PaymentProviderCustomerSelector;

export function createPaymentProviderCustomerSelectorFactory(): PaymentProviderCustomerSelectorFactory {
    const getPaymentProviderCustomer = createSelector(
        (state: PaymentProviderCustomerState) => state.data,
        (data) => () => data,
    );

    const getPaymentProviderCustomerOrThrow = createSelector(
        getPaymentProviderCustomer,
        (getPaymentProviderCustomer) => () => {
            return guard(
                getPaymentProviderCustomer(),
                () => new MissingDataError(MissingDataErrorType.MissingPaymentProviderCustomer),
            );
        },
    );

    return memoizeOne(
        (state: PaymentProviderCustomerState = DEFAULT_STATE): PaymentProviderCustomerSelector => {
            return {
                getPaymentProviderCustomer: getPaymentProviderCustomer(state),
                getPaymentProviderCustomerOrThrow: getPaymentProviderCustomerOrThrow(state),
            };
        },
    );
}
