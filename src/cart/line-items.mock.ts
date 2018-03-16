import { PhysicalItem } from '../cart';

export function getPhysicalItem(): PhysicalItem {
    return {
        id: 666,
        variantId: 71,
        productId: 103,
        sku: 'CLC',
        name: 'Canvas Laundry Cart',
        url: '/canvas-laundry-cart/',
        quantity: 1,
        isTaxable: true,
        imageUrl: '/images/canvas-laundry-cart.jpg',
        discounts: [],
        discountAmount: 0,
        couponAmount: 0,
        listPrice: 200,
        salePrice: 200,
        extendedListPrice: 200,
        extendedSalePrice: 200,
        isShippingRequired: true,
    };
}
