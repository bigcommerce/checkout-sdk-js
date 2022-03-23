import { memoizeOne } from '@bigcommerce/memoize';

import { Address } from '../address';
import { createSelector } from '../common/selector';

import ConsignmentState, { DEFAULT_STATE } from './consignment-state';

export default interface ShippingAddressSelector {
    getFulfilmentAddress(): Address | undefined;
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

            return consignments[0].address;
        }
    );

    return memoizeOne((
        state: ConsignmentState = DEFAULT_STATE
    ): ShippingAddressSelector => {
        return {
            getShippingAddress: getShippingAddress(state),
            getFulfilmentAddress: getShippingAddress(state),
        };
    });
}
