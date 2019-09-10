import { DigitalItem, GiftCertificateItem, PhysicalItem } from '../cart';

export function getPhysicalItem(): PhysicalItem {
    return {
        id: '666',
        variantId: 71,
        productId: 103,
        sku: 'CLC',
        name: 'Canvas Laundry Cart',
        url: '/canvas-laundry-cart/',
        quantity: 1,
        brand: 'OFS',
        isTaxable: true,
        imageUrl: '/images/canvas-laundry-cart.jpg',
        discounts: [],
        discountAmount: 0,
        couponAmount: 0,
        listPrice: 200,
        salePrice: 200,
        comparisonPrice: 200,
        extendedListPrice: 200,
        extendedSalePrice: 200,
        isShippingRequired: true,
        addedByPromotion: false,
        options: [
            {
                name: 'n',
                nameId: 1,
                value: 'v',
                valueId: 3,
            },
        ],
        categories: [[{name: 'Cat 1'}], [{name: 'Furniture'}, {name: 'Bed'}]],
        categoryNames: ['Cat 1'],
    };
}

export function getDigitalItem(): DigitalItem {
    return {
        id: '667',
        variantId: 71,
        productId: 103,
        sku: 'CLC',
        name: 'Canvas Laundry Cart',
        url: '/canvas-laundry-cart/',
        quantity: 1,
        brand: 'OFS',
        isTaxable: true,
        imageUrl: '/images/canvas-laundry-cart.jpg',
        discounts: [],
        discountAmount: 0,
        couponAmount: 0,
        listPrice: 200,
        salePrice: 200,
        comparisonPrice: 200,
        downloadPageUrl: 'url.php',
        downloadFileUrls: [],
        downloadSize: '',
        extendedListPrice: 200,
        extendedSalePrice: 200,
        addedByPromotion: false,
        options: [
            {
                name: 'n',
                nameId: 1,
                value: 'v',
                valueId: 3,
            },
        ],
        categories: [[{name: 'Cat 1'}], [{name: 'Cat 2'}], [{name: 'Cat 3'}]],
        categoryNames: ['Cat 1'],
    };
}

export function getGiftCertificateItem(): GiftCertificateItem {
    return {
        id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
        name: '$100 Gift Certificate',
        message: 'message',
        amount: 100,
        taxable: false,
        theme: 'General',
        sender: {
            name: 'pablo',
            email: 'pa@blo.com',
        },
        recipient: {
            name: 'luis',
            email: 'lu@is.com',
        },
    };
}
