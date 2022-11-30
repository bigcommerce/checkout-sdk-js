import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getOrderPaymentRequest } from './payments.mock';

export default function getOrderRequestBody(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: getOrderPaymentRequest(),
    };
}
