import { getGiftCertificateItem } from '../cart/line-items.mock';
import { getPhysicalItem } from '../order/line-items.mock';
import { getOrder } from '../order/orders.mock';

import { hasPayloadLimit } from './analytics-tracker-window';

describe('analytics step tracker helpers',  () => {
    test('should return false on small order', () => {
        const order = getOrder();
        const result = hasPayloadLimit(order);

        expect(result).toBe(false);
    });

    test('should return true on large order', () => {
        const result = hasPayloadLimit({
            ...getOrder(),
            lineItems: {
                physicalItems: Array.from(new Array(100)).map(() => getPhysicalItem()),
                digitalItems: [],
                giftCertificates: [
                    getGiftCertificateItem(),
                ],
                customItems: [],
            },
        });

        expect(result).toBe(true);
    });
});
