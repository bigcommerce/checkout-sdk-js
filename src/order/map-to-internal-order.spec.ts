import { getCheckoutWithPayments } from '../checkout/checkouts.mock';

import { getCompleteOrder as getInternalOrder } from './internal-orders.mock';
import mapToInternalOrder, { mapToInternalIncompleteOrder } from './map-to-internal-order';
import { getOrder } from './orders.mock';

describe('mapToInternalOrder()', () => {
    it('maps to internal line items', () => {
        expect(mapToInternalOrder(getOrder()))
            .toEqual(getInternalOrder());
    });
});

describe('mapToInternalIncompleteOrder()', () => {
    it('maps to internal incomplete order', () => {
        expect(mapToInternalIncompleteOrder(getCheckoutWithPayments()))
            .toEqual({
                isComplete: false,
                orderId: null,
                payment: {
                    gateway: null,
                    id: 'authorizenet',
                    status: 'PAYMENT_STATUS_ACKNOWLEDGE',
                },
            });
    });
});
