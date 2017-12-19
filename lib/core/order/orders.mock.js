"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var customers_mock_1 = require("../customer/customers.mock");
var order_summaries_mock_1 = require("./order-summaries.mock");
var payments_mock_1 = require("../payment/payments.mock");
function getOrderRequestBody() {
    return {
        customerMessage: '',
        useStoreCredit: false,
        payment: payments_mock_1.getPayment(),
    };
}
exports.getOrderRequestBody = getOrderRequestBody;
function getIncompleteOrder() {
    return {
        orderId: null,
        token: null,
        payment: [],
        socialData: null,
        status: 'ORDER_STATUS_INCOMPLETE',
        customerCreated: false,
        hasDigitalItems: false,
        isDownloadable: false,
        isComplete: false,
        callbackUrl: null,
    };
}
exports.getIncompleteOrder = getIncompleteOrder;
function getIncompleteOrderState() {
    return {
        meta: {},
        data: getIncompleteOrder(),
    };
}
exports.getIncompleteOrderState = getIncompleteOrderState;
function getCompleteOrder() {
    return tslib_1.__assign({}, order_summaries_mock_1.getOrderSummary(), getIncompleteOrder(), { orderId: 295, payment: {
            id: 'authorizenet',
            status: 'PAYMENT_STATUS_FINALIZE',
            helpText: '%%OrderID%% text %%OrderID%%',
            confirmationRedirectUrl: '',
        }, isDownloadable: false, customerCanBeCreated: true, isComplete: true, socialData: {
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
        } });
}
exports.getCompleteOrder = getCompleteOrder;
function getCompleteOrderResponseBody() {
    return {
        meta: {},
        data: {
            customer: customers_mock_1.getGuestCustomer(),
            order: getCompleteOrder(),
        },
    };
}
exports.getCompleteOrderResponseBody = getCompleteOrderResponseBody;
function getCompleteOrderState() {
    return {
        meta: {},
        data: getCompleteOrder(),
    };
}
exports.getCompleteOrderState = getCompleteOrderState;
function getSubmitOrderResponseHeaders() {
    return {
        token: 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDcxODcxMzMsIm5iZiI6MTUwNzE4MzUzMywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoiMTUwNDA5ODgyMSIsImp0aSI6IjNkOTA4ZDE5LTY4OTMtNGQzYi1iMWEwLWJjNWYzMjRhM2ZiZCIsImlhdCI6MTUwNzE4MzUzMywiZGF0YSI6eyJzdG9yZV9pZCI6IjE1MDQwOTg4MjEiLCJvcmRlcl9pZCI6IjExOSIsImFtb3VudCI6MjAwMDAsImN1cnJlbmN5IjoiVVNEIn19.FSfZpI98l3_p5rbQdlHNeCfKR5Dwwk8_fvPZvtb64-Q',
    };
}
exports.getSubmitOrderResponseHeaders = getSubmitOrderResponseHeaders;
function getSubmitOrderResponseBody() {
    return {
        data: {
            customer: customers_mock_1.getGuestCustomer(),
            order: getSubmittedOrder(),
        },
        meta: {
            deviceFingerprint: 'a084205e-1b1f-487d-9087-e072d20747e5',
        },
    };
}
exports.getSubmitOrderResponseBody = getSubmitOrderResponseBody;
function getSubmittedOrder() {
    var order = getCompleteOrder();
    return tslib_1.__assign({}, order, { payment: tslib_1.__assign({}, order.payment, { status: '' }) });
}
exports.getSubmittedOrder = getSubmittedOrder;
function getSubmittedOrderState() {
    return {
        meta: tslib_1.__assign({}, getSubmitOrderResponseBody().meta, getSubmitOrderResponseHeaders()),
        data: getSubmittedOrder(),
    };
}
exports.getSubmittedOrderState = getSubmittedOrderState;
//# sourceMappingURL=orders.mock.js.map