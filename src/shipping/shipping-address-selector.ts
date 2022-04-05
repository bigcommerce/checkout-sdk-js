import { memoizeOne } from '@bigcommerce/memoize';

import { Address } from '../address';
import { createSelector } from '../common/selector';

import ConsignmentState, { DEFAULT_STATE } from './consignment-state';

export default interface ShippingAddressSelector {
    getShippingAddress(): Address | undefined;
}

export type ShippingAddressSelectorFactory = (state: ConsignmentState) => ShippingAddressSelector;

export function createShippingAddressSelectorFactory(): ShippingAddressSelectorFactory {
    const getShippingAddress = createSelector(
        (state: ConsignmentState) => state.data,
        consignments => () => {
            const shippingConsignment = consignments?.find(consignment => !consignment.selectedPickupOption);

            return shippingConsignment?.shippingAddress;
        }
    );

    return memoizeOne((
        state: ConsignmentState = DEFAULT_STATE
    ): ShippingAddressSelector => {
        return {
            getShippingAddress: getShippingAddress(state),
        };
    });
}
