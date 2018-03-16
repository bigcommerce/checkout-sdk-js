import { getCheckout } from '../checkout/checkouts.mock';
import { getOrder } from './orders.mock';
import { getCompleteOrder as getInternalOrder } from './internal-orders.mock';
import mapFromOrderToInternal from './map-from-order-to-internal';

describe('mapFromOrderToInternal()', () => {
    it('maps to internal line items', () => {
        expect(mapFromOrderToInternal(getOrder(), getInternalOrder()))
            .toEqual(getInternalOrder());
    });
});
