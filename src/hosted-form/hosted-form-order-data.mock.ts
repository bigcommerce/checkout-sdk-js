import { getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { getConfig } from '../config/configs.mock';
import { getOrder, getOrderMeta } from '../order/orders.mock';
import { getPaymentMethod, getPaymentMethodsMeta } from '../payment/payment-methods.mock';

import HostedFormOrderData from './hosted-form-order-data';

export function getHostedFormOrderData(): HostedFormOrderData {
    return {
        authToken: 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        checkout: getCheckoutWithGiftCertificates(),
        config: getConfig(),
        order: getOrder(),
        orderMeta: getOrderMeta(),
        payment: {},
        paymentMethod: getPaymentMethod(),
        paymentMethodMeta: getPaymentMethodsMeta(),
    };
}
