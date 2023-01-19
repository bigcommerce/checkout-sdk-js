import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import OrderBillingAddressState, {
    DEFAULT_STATE,
    OrderBillingAddress,
} from './order-billing-address-state';

export default interface OrderBillingAddressSelector {
    getOrderBillingAddress(): OrderBillingAddress | undefined;
}

export type OrderBillingAddressSelectorFactory = (
    state: OrderBillingAddressState,
) => OrderBillingAddressSelector;

export function createOrderBillingAddressSelectorFactory(): OrderBillingAddressSelectorFactory {
    const getOrderBillingAddress = createSelector(
        (state: OrderBillingAddressState) => state.data,
        (data) => () => data,
    );

    return memoizeOne(
        (state: OrderBillingAddressState = DEFAULT_STATE): OrderBillingAddressSelector => {
            return {
                getOrderBillingAddress: getOrderBillingAddress(state),
            };
        },
    );
}
