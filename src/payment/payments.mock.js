import { getCart } from '../cart/internal-carts.mock';
import { getSubmittedOrder } from '../order/internal-orders.mock';
import { getFlatRateOption } from '../shipping/internal-shipping-options.mock';
import { getGuestCustomer } from '../customer/internal-customers.mock';
import { getAuthorizenet, getPaymentMethodsMeta } from './payment-methods.mock';
import { getQuote } from '../quote/internal-quotes.mock';

export function getPayment() {
    return {
        methodId: 'authorizenet',
        gatewayId: null,
        source: 'bcapp-checkout-uco',
        paymentData: {
            ccExpiry: {
                month: '10',
                year: '20',
            },
            ccName: 'BigCommerce',
            ccNumber: '4111111111111111',
            ccType: 'visa',
            ccCvv: '123',
        },
    };
}

export function getPaymentRequestBody() {
    return {
        authToken: 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDcxODcxMzMsIm5iZiI6MTUwNzE4MzUzMywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoiMTUwNDA5ODgyMSIsImp0aSI6IjNkOTA4ZDE5LTY4OTMtNGQzYi1iMWEwLWJjNWYzMjRhM2ZiZCIsImlhdCI6MTUwNzE4MzUzMywiZGF0YSI6eyJzdG9yZV9pZCI6IjE1MDQwOTg4MjEiLCJvcmRlcl9pZCI6IjExOSIsImFtb3VudCI6MjAwMDAsImN1cnJlbmN5IjoiVVNEIn19.FSfZpI98l3_p5rbQdlHNeCfKR5Dwwk8_fvPZvtb64-Q',
        billingAddress: getQuote().billingAddress,
        cart: getCart(),
        customer: getGuestCustomer(),
        order: getSubmittedOrder(),
        payment: getPayment().paymentData,
        paymentMethod: getAuthorizenet(),
        quoteMeta: getPaymentMethodsMeta(),
        shippingAddress: getQuote().shippingAddress,
        shippingOption: getFlatRateOption(),
        source: 'bcapp-checkout-uco',
        store: {
            storeHash: 'k1drp8k8',
            storeId: '1504098821',
            storeLanguage: 'en_US',
            storeName: 's1504098821',
        },
    };
}

export function getPaymentResponseBody() {
    return {
        status: 'ok',
        id: 'b12e69cb-d76e-4d86-8d3d-94e8a07c9051',
        avs_result: {},
        cvv_result: {},
        three_ds_result: {},
        fraud_review: true,
        transaction_type: 'purchase',
        errors: [],
    };
}

export function getErrorPaymentResponseBody() {
    return {
        status: 'error',
        id: '1093a806-6cc2-4b5a-b551-77fd21446a1b',
        avs_result: {},
        cvv_result: {},
        three_ds_result: {},
        fraud_review: true,
        transaction_type: 'purchase',
        errors: [
            'Insufficient funds',
        ],
    };
}

export function getPaymentState() {
    return {
        data: getPaymentResponseBody(),
    };
}
