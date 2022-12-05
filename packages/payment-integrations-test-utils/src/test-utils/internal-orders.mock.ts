import {
    OrderPaymentRequestBody,
    OrderRequestBody,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getPayment } from './payments.mock';

export default function getOrderRequestBody(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: getPayment() as OrderPaymentRequestBody,
    };
}
