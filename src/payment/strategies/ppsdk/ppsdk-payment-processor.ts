import { OrderPaymentRequestBody } from '../../../order';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

export interface PaymentProcessor {
    process(paymentMethod: PPSDKPaymentMethod, payment: OrderPaymentRequestBody | undefined): Promise<void>;
}
