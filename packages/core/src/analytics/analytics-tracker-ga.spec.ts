import { ExtraItemsData } from '@bigcommerce/checkout-sdk/analytics';

import { LineItemMap } from '../cart';
import { getGiftCertificateItem } from '../cart/line-items.mock';
import { getPhysicalItem } from '../order/line-items.mock';
import { getOrder } from '../order/orders.mock';

import { AnalyticsProduct } from './analytics-step-tracker';
import { isPayloadSizeLimitReached } from './analytics-tracker-ga';

describe('analytics step tracker helpers', () => {
    test('should return false on small order', () => {
        const order = getOrder();

        const result = isPayloadSizeLimitReached({
            orderId: order.orderId,
            affiliation: 'storeName',
            revenue: order.orderAmount,
            shipping: order.shippingCostTotal,
            tax: order.taxTotal,
            discount: order.discountAmount,
            coupon: (order.coupons || []).map((coupon) => coupon.code.toUpperCase()).join(','),
            currency: 'USD',
            products: getPayloadProducts({}, order.lineItems),
        });

        expect(result).toBe(false);
    });

    test('should return true on large order', () => {
        const order = getOrder();

        const lineItems = {
            physicalItems: Array.from(new Array(100)).map(() => getPhysicalItem()),
            digitalItems: [],
            giftCertificates: [getGiftCertificateItem()],
            customItems: [],
        };

        const result = isPayloadSizeLimitReached({
            orderId: order.orderId,
            affiliation: 'storeName',
            revenue: order.orderAmount,
            shipping: order.shippingCostTotal,
            tax: order.taxTotal,
            discount: order.discountAmount,
            coupon: (order.coupons || []).map((coupon) => coupon.code.toUpperCase()).join(','),
            currency: 'USD',
            products: getPayloadProducts({}, lineItems),
        });

        expect(result).toBe(true);
    });
});

function getPayloadProducts(itemsData: ExtraItemsData, lineItems: LineItemMap): AnalyticsProduct[] {
    const customItems: AnalyticsProduct[] = (lineItems.customItems || []).map((item) => ({
        product_id: item.id,
        sku: item.sku,
        price: item.listPrice,
        quantity: item.quantity,
        name: item.name,
    }));

    const giftCertificateItems: AnalyticsProduct[] = lineItems.giftCertificates.map((item) => {
        return {
            product_id: item.id,
            price: item.amount,
            name: item.name,
            quantity: 1,
        };
    });

    const physicalAndDigitalItems: AnalyticsProduct[] = [
        ...lineItems.physicalItems,
        ...lineItems.digitalItems,
    ].map((item) => {
        let itemAttributes;

        if (item.options && item.options.length) {
            itemAttributes = item.options.map((option) => `${option.name}:${option.value}`);
            itemAttributes.sort();
        }

        return {
            product_id: item.productId,
            sku: item.sku,
            price: item.salePrice,
            image_url: item.imageUrl,
            name: item.name,
            quantity: item.quantity,
            brand: itemsData[item.productId] ? itemsData[item.productId].brand : '',
            category: itemsData[item.productId] ? itemsData[item.productId].category : '',
            variant: (itemAttributes || []).join(', '),
        };
    });

    return [...customItems, ...physicalAndDigitalItems, ...giftCertificateItems];
}
