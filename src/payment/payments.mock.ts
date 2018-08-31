import { mapToInternalAddress } from '../address';
import { getBillingAddress } from '../billing/billing-addresses.mock';
import { mapToInternalCart } from '../cart';
import { getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { mapToInternalCustomer } from '../customer';
import { getCustomer } from '../customer/customers.mock';
import { mapToInternalOrder } from '../order';
import { getOrder, getOrderMeta } from '../order/orders.mock';
import { getConsignments } from '../shipping/consignments.mock';
import { getFlatRateOption } from '../shipping/internal-shipping-options.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import Payment, { CreditCardInstrument } from './payment';
import { getAuthorizenet, getPaymentMethodsMeta } from './payment-methods.mock';
import PaymentRequestBody from './payment-request-body';
import PaymentResponseBody from './payment-response-body';
import PaymentState from './payment-state';

export function getPayment(): Payment {
    return {
        methodId: 'authorizenet',
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

export function getPaymentRequestBody(): PaymentRequestBody {
    return {
        authToken: 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDcxODcxMzMsIm5iZiI6MTUwNzE4MzUzMywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoiMTUwNDA5ODgyMSIsImp0aSI6IjNkOTA4ZDE5LTY4OTMtNGQzYi1iMWEwLWJjNWYzMjRhM2ZiZCIsImlhdCI6MTUwNzE4MzUzMywiZGF0YSI6eyJzdG9yZV9pZCI6IjE1MDQwOTg4MjEiLCJvcmRlcl9pZCI6IjExOSIsImFtb3VudCI6MjAwMDAsImN1cnJlbmN5IjoiVVNEIn19.FSfZpI98l3_p5rbQdlHNeCfKR5Dwwk8_fvPZvtb64-Q',
        billingAddress: mapToInternalAddress(getBillingAddress()),
        cart: mapToInternalCart(getCheckoutWithGiftCertificates()),
        customer: mapToInternalCustomer(getCustomer(), getBillingAddress()),
        order: mapToInternalOrder(getOrder(), getOrderMeta()),
        orderMeta: getOrderMeta(),
        payment: getPayment().paymentData as CreditCardInstrument,
        paymentMethod: getAuthorizenet(),
        quoteMeta: { request: getPaymentMethodsMeta() },
        shippingAddress: mapToInternalAddress(getShippingAddress(), getConsignments()),
        shippingOption: getFlatRateOption(),
        source: 'bigcommerce-checkout-js-sdk',
        store: {
            storeHash: 'k1drp8k8',
            storeId: '1504098821',
            storeLanguage: 'en_US',
            storeName: 's1504098821',
        },
    };
}

export function getPaymentResponseBody(): PaymentResponseBody {
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

export function getErrorPaymentResponseBody(): PaymentResponseBody {
    return {
        status: 'error',
        id: '1093a806-6cc2-4b5a-b551-77fd21446a1b',
        avs_result: {},
        cvv_result: {},
        three_ds_result: {},
        fraud_review: true,
        transaction_type: 'purchase',
        errors: [
            { code: 'insufficient_funds', message: 'Insufficient funds' },
        ],
    };
}

export function getPaymentState(): PaymentState {
    return {
        data: getPaymentResponseBody(),
    };
}
