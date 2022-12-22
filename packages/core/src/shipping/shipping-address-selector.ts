import { memoizeOne } from '@bigcommerce/memoize';

import { Address } from '../address';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import ConsignmentState, { DEFAULT_STATE } from './consignment-state';

export default interface ShippingAddressSelector {
    getShippingAddress(): Address | undefined;
    getShippingAddresses(): Address[];
    getShippingAddressOrThrow(): Address;
}

export type ShippingAddressSelectorFactory = (state: ConsignmentState) => ShippingAddressSelector;

export function createShippingAddressSelectorFactory(): ShippingAddressSelectorFactory {
    const getShippingAddress = createSelector(
        (state: ConsignmentState) => state.data,
        (consignments) => () => {
            const shippingConsignment = consignments?.find(
                (consignment) => !consignment.selectedPickupOption,
            );

            return shippingConsignment?.shippingAddress;
        },
    );

    const getShippingAddressOrThrow = createSelector(
        getShippingAddress,
        (getShippingAddress) => () => {
            return guard(
                getShippingAddress(),
                () => new MissingDataError(MissingDataErrorType.MissingShippingAddress),
            );
        },
    );

    const getShippingAddresses = createSelector(
        (state: ConsignmentState) => state.data,
        (consignments) => () => {
            const shippingConsignments = consignments?.filter(
                (consignment) => !consignment.selectedPickupOption,
            );

            return shippingConsignments
                ? shippingConsignments.map((consignment) => consignment.shippingAddress)
                : [];
        },
    );

    return memoizeOne((state: ConsignmentState = DEFAULT_STATE): ShippingAddressSelector => {
        return {
            getShippingAddress: getShippingAddress(state),
            getShippingAddresses: getShippingAddresses(state),
            getShippingAddressOrThrow: getShippingAddressOrThrow(state),
        };
    });
}
