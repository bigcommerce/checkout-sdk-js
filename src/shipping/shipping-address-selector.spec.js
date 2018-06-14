import ShippingAddressSelector from './shipping-address-selector';
import { getConfigState } from '../config/configs.mock';
import { getConsignmentsState } from './consignments.mock';
import { getShippingAddress } from './internal-shipping-addresses.mock';

describe('ShippingAddressSelector', () => {
    let shippingAddressSelector;
    let state;

    beforeEach(() => {
        state = {
            config: getConfigState(),
            consignments: getConsignmentsState(),
        };
    });

    describe('#getShippingAddress()', () => {
        it('returns the current shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector(state.consignments, state.config);

            expect(shippingAddressSelector.getShippingAddress()).toEqual(getShippingAddress());
        });

        describe('when there is no shipping information', () => {
            beforeEach(() => {
                state = {
                    consignments: { data: {} },
                    config: getConfigState(),
                };
            });

            it('returns a shipping address with preselected country', () => {
                shippingAddressSelector = new ShippingAddressSelector(state.consignments, state.config);

                expect(shippingAddressSelector.getShippingAddress().countryCode).toEqual('AU');
            });
        });

        describe('when there is no shipping neither config information', () => {
            beforeEach(() => {
                state = {
                    consignments: { data: {} },
                    config: { data: {} },
                };
            });

            it('returns undefined', () => {
                shippingAddressSelector = new ShippingAddressSelector(state.consignments, state.config);

                expect(shippingAddressSelector.getShippingAddress()).toBeUndefined();
            });
        });
    });
});
