import { Address } from '../address';
import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import ConsignmentState, { DEFAULT_STATE } from './consignment-state';

export default interface ShippingAddressSelector {
    getShippingAddress(): Address | undefined;
}

export type ShippingAddressSelectorFactory = (state: ConsignmentState) => ShippingAddressSelector;

export function createShippingAddressSelectorFactory(): ShippingAddressSelectorFactory {
    const getShippingAddress = createSelector(
        (state: ConsignmentState) => state.data,
        consignments => () => {
            if (!consignments || !consignments[0]) {
                return;
            }

            return consignments[0].shippingAddress;
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
