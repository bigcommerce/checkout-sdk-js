"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getOrderSummary() {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        items: [
            {
                id: '12e11c8f-7dce-4da3-9413-b649533f8bad',
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
            amount: 200,
            integerAmount: 20000,
        },
    };
}
exports.getOrderSummary = getOrderSummary;
//# sourceMappingURL=order-summaries.mock.js.map