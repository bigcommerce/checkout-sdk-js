import { ConfigState } from '../config';
import { getConfigState } from '../config/configs.mock';

import ConsignmentState from './consignment-state';
import { getConsignment, getConsignmentsState } from './consignments.mock';
import ShippingAddressSelector from './shipping-address-selector';

describe('ShippingAddressSelector', () => {
    let shippingAddressSelector: ShippingAddressSelector;
    let consignmentState: ConsignmentState;
    let configState: ConfigState;

    describe('#getShippingAddress()', () => {
        beforeEach(() => {
            consignmentState = getConsignmentsState();
            configState = getConfigState();
        });

        it('returns the current shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector(consignmentState, configState);

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

            it('returns a shipping address with preselected country', () => {
                shippingAddressSelector = new ShippingAddressSelector(consignmentState, configState);

                expect(shippingAddressSelector.getShippingAddress()).toEqual(expect.objectContaining({
                    countryCode: 'AU',
                }));
            });
        });

        describe('when there is no shipping neither config information', () => {
            beforeEach(() => {
                consignmentState = {
                    ...consignmentState,
                    data: undefined,
                };

                configState = {
                    ...configState,
                    data: undefined,
                };
            });

            it('returns undefined', () => {
                shippingAddressSelector = new ShippingAddressSelector(consignmentState, configState);

                expect(shippingAddressSelector.getShippingAddress()).toBeUndefined();
            });
        });
    });
});
