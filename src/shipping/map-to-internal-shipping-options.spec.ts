import { getConsignment } from './consignments.mock';
import { getShippingOptions as getInternalShippingOptions } from './internal-shipping-options.mock';
import mapToInternalShippingOptions from './map-to-internal-shipping-options';

describe('mapToInternalShippingOptions()', () => {
    it('maps to internal shipping options', () => {
        expect(mapToInternalShippingOptions([getConsignment()], getInternalShippingOptions()))
            .toEqual(getInternalShippingOptions());
    });
});
