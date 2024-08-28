import {
    getCheckoutWithGiftCertificates,
    getConfig,
    getOrder,
    getOrderMeta,
    getPaymentMethod,
    getPaymentMethodsMeta,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import HostedFormOrderData from './hosted-form-order-data';

export function getHostedFormOrderData(): HostedFormOrderData {
    return {
        authToken: 'auth-token',
        checkout: getCheckoutWithGiftCertificates(),
        config: getConfig(),
        order: getOrder(),
        orderMeta: getOrderMeta(),
        payment: {},
        paymentMethod: getPaymentMethod(),
        paymentMethodMeta: getPaymentMethodsMeta(),
    };
}
