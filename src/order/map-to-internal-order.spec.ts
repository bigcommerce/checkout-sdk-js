import { getCheckout } from '../checkout/checkouts.mock';
import { getOrder } from './orders.mock';
import { getCompleteOrder as getInternalOrder } from './internal-orders.mock';
import mapToInternalOrder from './map-to-internal-order';

describe('mapToInternalOrder()', () => {
    it('maps to internal line items', () => {
        expect(mapToInternalOrder(getCheckout(), getOrder(), getInternalOrder()))
            .toEqual(getInternalOrder());
    });
});
