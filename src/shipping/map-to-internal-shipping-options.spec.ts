import { omit } from 'lodash';

import { getConsignment } from './consignments.mock';
import { getFlatRateOption, getShippingOptions as getInternalShippingOptions } from './internal-shipping-options.mock';
import mapToInternalShippingOptions from './map-to-internal-shipping-options';

describe('mapToInternalShippingOptions()', () => {
    it('maps to internal shipping options', () => {
        expect(mapToInternalShippingOptions([getConsignment()]))
            .toEqual(getInternalShippingOptions());
    });

    it('maps to selected shipping option if none available', () => {
        expect(mapToInternalShippingOptions([omit(getConsignment(), 'availableShippingOptions')]))
            .toEqual(getInternalShippingOptions());
    });
});
