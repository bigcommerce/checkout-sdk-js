import { getShippingOption } from './shipping-options.mock';
import { getFlatRateOption as getInternalShippingOption } from './internal-shipping-options.mock';
import mapToInternalShippingOption from './map-to-internal-shipping-option';

describe('mapToInternalShippingOption()', () => {
    it('maps to internal shipping option', () => {
        expect(mapToInternalShippingOption(getShippingOption(), getInternalShippingOption()))
            .toEqual(getInternalShippingOption());
    });
});
