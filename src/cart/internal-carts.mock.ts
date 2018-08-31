import InternalCart from './internal-cart';

export function getCart(): InternalCart {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        items: [
            {
                id: '666',
                type: 'ItemPhysicalEntity',
                name: 'Canvas Laundry Cart',
                downloadsPageUrl: undefined,
                imageUrl: '/images/canvas-laundry-cart.jpg',
                quantity: 1,
                amount: 200,
                discount: 0,
                amountAfterDiscount: 200,
                attributes: [
                    {
                        name: 'n',
                        value: 'v',
                    },
                ],
                integerAmount: 20000,
                integerDiscount: 0,
                integerAmountAfterDiscount: 20000,
                variantId: 71,
            },
            {
                id: '667',
                type: 'ItemDigitalEntity',
                name: 'Canvas Laundry Cart',
                downloadsPageUrl: 'url.php',
                imageUrl: '/images/canvas-laundry-cart.jpg',
                quantity: 1,
                amount: 200,
                discount: 0,
                amountAfterDiscount: 200,
                attributes: [
                    {
                        name: 'n',
                        value: 'v',
                    },
                ],
                integerAmount: 20000,
                integerDiscount: 0,
                integerAmountAfterDiscount: 20000,
                variantId: 71,
            },
            {
                id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
                name: '$100 Gift Certificate',
                type: 'ItemGiftCertificateEntity',
                sender: {
                    name: 'pablo',
                    email: 'pa@blo.com',
                },
                recipient: {
                    name: 'luis',
                    email: 'lu@is.com',
                },
                imageUrl: '',
                quantity: 1,
                amount: 100,
                discount: 0,
                amountAfterDiscount: 100,
                attributes: [],
                integerAmount: 10000,
                integerDiscount: 0,
                integerAmountAfterDiscount: 10000,
                variantId: null,
            },
        ],
        currency: 'USD',
        subtotal: {
            amount: 190,
            integerAmount: 19000,
        },
        coupon: {
            discountedAmount: 10,
            coupons: [
                {
                    code: 'savebig2015',
                    discount: '20% off each item',
                    discountType: 1,
                },
                {
                    code: '279F507D817E3E7',
                    discount: '$5.00 off the shipping total',
                    discountType: 3,
                },
            ],
        },
        discount: {
            amount: 10,
            integerAmount: 1000,
        },
        discountNotifications: [
            {
                placeholders: [],
                discountType: null,
                message: '',
                messageHtml: 'foo',
            },
        ],
        giftCertificate: {
            totalDiscountedAmount: 14,
            appliedGiftCertificates: {
                gc: {
                    code: 'gc',
                    discountedAmount: 7,
                    remainingBalance: 3,
                    giftCertificate: {
                        code: 'gc',
                        balance: 10,
                        purchaseDate: 'ddmmyy',
                    },
                },
                gc2: {
                    code: 'gc2',
                    discountedAmount: 7,
                    remainingBalance: 3,
                    giftCertificate: {
                        code: 'gc2',
                        balance: 10,
                        purchaseDate: 'ddmmyy',
                    },
                },
            },
        },
        shipping: {
            amount: 15,
            integerAmount: 1500,
            amountBeforeDiscount: 20,
            integerAmountBeforeDiscount: 2000,
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
                amount: 3,
            },
        ],
        taxTotal: {
            amount: 0,
            integerAmount: 0,
        },
        handling: {
            amount: 8,
            integerAmount: 800,
        },
        grandTotal: {
            amount: 190,
            integerAmount: 19000,
        },
    };
}

export function getCartResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: {},
    };
}

export function getCartState() {
    return {
        data: getCart(),
        errors: {},
        meta: {},
        statuses: {},
    };
}
