import { OrderPaymentRequestBody } from '../../../order';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

import { initializeNone, isNone } from './initializers';

export type PaymentProcessor = (payment: OrderPaymentRequestBody | undefined) => Promise<void>;

type GetPaymentProcessor = (paymentMethod: PPSDKPaymentMethod) => PaymentProcessor | undefined;

export const getPaymentProcessor: GetPaymentProcessor = paymentMethod => {
    const { initializationStrategy } = paymentMethod;

    if (isNone(initializationStrategy)) {
        return initializeNone(paymentMethod);
    }

    return undefined;
};
