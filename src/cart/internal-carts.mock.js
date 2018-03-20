export function getCart() {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        items: [
            {
                id: 103,
                type: 'ItemPhysicalEntity',
                name: 'Canvas Laundry Cart',
                imageUrl: '/images/canvas-laundry-cart.jpg',
                quantity: 1,
                amount: 200,
                discount: 0,
                amountAfterDiscount: 200,
                tax: 0,
                attributes: [],
                integerAmount: 20000,
                integerDiscount: 0,
                integerAmountAfterDiscount: 20000,
                integerTax: 0,
                variantId: 71,
            },
        ],
        currency: 'USD',
        subtotal: {
            amount: 200,
            integerAmount: 20000,
        },
        coupon: {
            discountedAmount: 5,
            coupons: [
                {
                    code: 'savebig2015',
                    discount: '20% off each item',
                    discountType: 1,
                    name: '20% off',
                },
            ],
        },
        discount: {
            amount: 10,
            integerAmount: 100,
        },
        discountNotifications: [],
        giftCertificate: {
            totalDiscountedAmount: 0,
            appliedGiftCertificates: [],
        },
        shipping: {
            amount: 15,
            integerAmount: 0,
            amountBeforeDiscount: 20,
            integerAmountBeforeDiscount: 0,
            required: true,
        },
        storeCredit: {
            amount: 0,
        },
        taxSubtotal: {
            amount: 0,
            integerAmount: 0,
        },
        taxes: [
            {
                name: 'Tax',
                amount: 0,
            },
        ],
        taxTotal: {
            amount: 0,
            integerAmount: 0,
        },
        handling: {
            amount: 8,
            integerAmount: 80,
        },
        grandTotal: {
            amount: 190,
            integerAmount: 19000,
        },
    };
}

export function getCartMeta() {
    return {
        request: {
            geoCountryCode: 'AU',
            deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
            sessionHash: 'cfbbbac580a920b395571fe086db1e06',
        },
    };
}

export function getCartResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: getCartMeta(),
    };
}

export function getCartState() {
    return {
        data: getCart(),
        meta: getCartMeta(),
    };
}
