import { PaymentRequestOptions } from './payment-request-options';

export interface PaymentInitializeOptions extends PaymentRequestOptions {
    [key: string]: unknown;
}
