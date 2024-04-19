import { getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { getConfig } from '../config/configs.mock';
import { getOrder, getOrderMeta } from '../order/orders.mock';
import { getPaymentMethod, getPaymentMethodsMeta } from '../payment/payment-methods.mock';

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
