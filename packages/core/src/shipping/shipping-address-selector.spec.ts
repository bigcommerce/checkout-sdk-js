import ConsignmentState from './consignment-state';
import { getConsignment, getConsignmentsState } from './consignments.mock';
import ShippingAddressSelector, { createShippingAddressSelectorFactory, ShippingAddressSelectorFactory } from './shipping-address-selector';

describe('ShippingAddressSelector', () => {
    let createShippingAddressSelector: ShippingAddressSelectorFactory;
    let shippingAddressSelector: ShippingAddressSelector;
    let consignmentState: ConsignmentState;

    describe('#getShippingAddress()', () => {
        beforeEach(() => {
            createShippingAddressSelector = createShippingAddressSelectorFactory();
            consignmentState = getConsignmentsState();
        });

        it('returns the current shipping address', () => {
            shippingAddressSelector = createShippingAddressSelector(consignmentState);

            expect(shippingAddressSelector.getShippingAddress())
                .toEqual(getConsignment().shippingAddress);
        });

        describe('when there is no shipping information', () => {
            beforeEach(() => {
                consignmentState = {
                    ...consignmentState,
                    data: undefined,
                };
            });

            it('returns undefined', () => {
                shippingAddressSelector = createShippingAddressSelector(consignmentState);

                expect(shippingAddressSelector.getShippingAddress()).toBeUndefined();
            });
        });
    });
});
