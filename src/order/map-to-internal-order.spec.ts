import { getCheckoutWithPayments } from '../checkout/checkouts.mock';

import { getAwaitingOrder } from './internal-orders.mock';
import mapToInternalOrder, { mapToInternalIncompleteOrder } from './map-to-internal-order';
import { getOrder, getOrderMeta } from './orders.mock';

describe('mapToInternalOrder()', () => {
    it('maps to internal line items', () => {
        expect(mapToInternalOrder(getOrder(), getOrderMeta()))
            .toEqual(getAwaitingOrder());
    });
});

describe('mapToInternalIncompleteOrder()', () => {
    it('maps to internal incomplete order', () => {
        expect(mapToInternalIncompleteOrder(getCheckoutWithPayments()))
            .toEqual({
                isComplete: false,
                orderId: null,
                payment: {
                    id: 'authorizenet',
                    status: 'PAYMENT_STATUS_ACKNOWLEDGE',
                },
            });
    });
});
