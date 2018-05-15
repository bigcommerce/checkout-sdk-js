import { InternalResponseBody } from '../common/http-request';

import PaymentMethod from './payment-method';

export type PaymentMethodsResponseBody = InternalResponseBody<PaymentMethodsResponseData>;
export type PaymentMethodResponseBody = InternalResponseBody<PaymentMethodResponseData>;

export interface PaymentMethodsResponseData {
    paymentMethods: PaymentMethod[];
}

export interface PaymentMethodResponseData {
    paymentMethod: PaymentMethod;
}
