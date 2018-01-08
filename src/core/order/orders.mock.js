import { getGuestCustomer } from '../customer/customers.mock';
import { getPayment } from '../payment/payments.mock';

export function getOrderRequestBody() {
    return {
        customerMessage: '',
        useStoreCredit: false,
        payment: getPayment(),
    };
}

export function getIncompleteOrder() {
    return {
        orderId: null,
        token: null,
        payment: {},
        socialData: null,
        status: 'ORDER_STATUS_INCOMPLETE',
        customerCreated: false,
        hasDigitalItems: false,
        isDownloadable: false,
        isComplete: false,
        callbackUrl: null,
    };
}

export function getIncompleteOrderState() {
    return {
        meta: {},
        data: getIncompleteOrder(),
    };
}

export function getCompleteOrder() {
    return {
        ...getIncompleteOrder(),
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
        orderId: 295,
        payment: {
            id: 'authorizenet',
            status: 'PAYMENT_STATUS_FINALIZE',
            helpText: '%%OrderID%% text %%OrderID%%',
            confirmationRedirectUrl: '',
        },
        isDownloadable: false,
        customerCanBeCreated: true,
        isComplete: true,
        socialData: {
            68: {
                fb: {
                    name: '[Sample] Sodling, black leather duffle bag',
                    description: 'How to write product descriptions that sellOne of the best things you can do to make your store successful is invest some time in writing great product descriptions. You want to provide detailed ye...',
                    image: 'https:\/\/cdn.bcapp.dev\/bcapp\/uvn6bltx\/products\/68\/images\/253\/HERO_mensstyle_034__54484.1348466546.190.285.jpg?c=1',
                    url: 'http:\/\/s1446156961.bcapp.dev\/sample-sodling-black-leather-duffle-bag\/',
                    shareText: "I just bought '[Sample] Sodling, black leather duffle bag' on s1446156961",
                    sharingLink: 'http:\/\/www.facebook.com\/sharer\/sharer.php?s=100&p[title]=I+just+bought+%27%5BSample%5D+Sodling%2C+black+leather+duffle+bag%27+on+s1446156961&p[summary]=How+to+write+product+descriptions+that+sellOne+of+the+best+things+you+can+do+to+make+your+store+successful+is+invest+some+time+in+writing+great+product+descriptions.+You+want+to+provide+detailed+ye...&p[url]=http%3A%2F%2Fs1446156961.bcapp.dev%2Fsample-sodling-black-leather-duffle-bag%2F&p[images][0]=http%3A%2F%2Fcdn.bcapp.dev%2Fbcapp%2Fuvn6bltx%2Fproducts%2F68%2Fimages%2F253%2FHERO_mensstyle_034__54484.1348466546.190.285.jpg%3Fc%3D1',
                },
                tw: {
                    name: '[Sample] Sodling, black leather duffle bag',
                    description: 'How to write product descriptions that sellOne of the best things you can do to make your store successful is invest some time in writing great product descriptions. You want to provide detailed ye...',
                    image: 'https:\/\/cdn.bcapp.dev\/bcapp\/uvn6bltx\/products\/68\/images\/253\/HERO_mensstyle_034__54484.1348466546.190.285.jpg?c=1',
                    url: 'http:\/\/s1446156961.bcapp.dev\/sample-sodling-black-leather-duffle-bag\/',
                    shareText: "I just bought '[Sample] Sodling, black leather duffle bag' on s1446156961",
                    sharingLink: 'https:\/\/twitter.com\/intent\/tweet?url=http%3A%2F%2Fs1446156961.bcapp.dev%2Fsample-sodling-black-leather-duffle-bag%2F&text=I+just+bought+%27%5BSample%5D+Sodling%2C+black+leather+duffle+bag%27+on+s1446156961',
                },
                gp: {
                    name: '[Sample] Sodling, black leather duffle bag',
                    description: 'How to write product descriptions that sellOne of the best things you can do to make your store successful is invest some time in writing great product descriptions. You want to provide detailed ye...',
                    image: 'https:\/\/cdn.bcapp.dev\/bcapp\/uvn6bltx\/products\/68\/images\/253\/HERO_mensstyle_034__54484.1348466546.190.285.jpg?c=1',
                    url: 'http:\/\/s1446156961.bcapp.dev\/sample-sodling-black-leather-duffle-bag\/',
                    shareText: '[Sample] Sodling, black leather duffle bag',
                    sharingLink: 'https:\/\/plus.google.com\/share?url=http:\/\/s1446156961.bcapp.dev\/sample-sodling-black-leather-duffle-bag\/',
                },
            },
        },
    };
}

export function getCompleteOrderResponseBody() {
    return {
        meta: {},
        data: {
            customer: getGuestCustomer(),
            order: getCompleteOrder(),
        },
    };
}

export function getCompleteOrderState() {
    return {
        meta: {},
        data: getCompleteOrder(),
    };
}

export function getSubmitOrderResponseHeaders() {
    return {
        token: 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDcxODcxMzMsIm5iZiI6MTUwNzE4MzUzMywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoiMTUwNDA5ODgyMSIsImp0aSI6IjNkOTA4ZDE5LTY4OTMtNGQzYi1iMWEwLWJjNWYzMjRhM2ZiZCIsImlhdCI6MTUwNzE4MzUzMywiZGF0YSI6eyJzdG9yZV9pZCI6IjE1MDQwOTg4MjEiLCJvcmRlcl9pZCI6IjExOSIsImFtb3VudCI6MjAwMDAsImN1cnJlbmN5IjoiVVNEIn19.FSfZpI98l3_p5rbQdlHNeCfKR5Dwwk8_fvPZvtb64-Q',
    };
}

export function getSubmitOrderResponseBody() {
    return {
        data: {
            customer: getGuestCustomer(),
            order: getSubmittedOrder(),
        },
        meta: {
            deviceFingerprint: 'a084205e-1b1f-487d-9087-e072d20747e5',
        },
    };
}

export function getSubmittedOrder() {
    const order = getCompleteOrder();

    return {
        ...order,
        payment: {
            ...order.payment,
            status: '',
        },
    };
}

export function getSubmittedOrderState() {
    return {
        meta: {
            ...getSubmitOrderResponseBody().meta,
            ...getSubmitOrderResponseHeaders(),
        },
        data: getSubmittedOrder(),
    };
}
