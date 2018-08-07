import ConsignmentState from './consignment-state';
import { getConsignment, getConsignmentsState } from './consignments.mock';
import ShippingAddressSelector from './shipping-address-selector';

describe('ShippingAddressSelector', () => {
    let shippingAddressSelector: ShippingAddressSelector;
    let consignmentState: ConsignmentState;

    describe('#getShippingAddress()', () => {
        beforeEach(() => {
            consignmentState = getConsignmentsState();
        });

        it('returns the current shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector(consignmentState);

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
                shippingAddressSelector = new ShippingAddressSelector(consignmentState);

                expect(shippingAddressSelector.getShippingAddress()).toBeUndefined();
            });
        });
    });
});
