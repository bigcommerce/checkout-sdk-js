import { getFlatRateOption as getInternalShippingOption } from './internal-shipping-options.mock';
import mapToInternalShippingOption from './map-to-internal-shipping-option';
import { getShippingOption } from './shipping-options.mock';

describe('mapToInternalShippingOption()', () => {
    it('maps to internal shipping option', () => {
        expect(mapToInternalShippingOption(getShippingOption(), true))
            .toEqual(getInternalShippingOption());
    });
});
