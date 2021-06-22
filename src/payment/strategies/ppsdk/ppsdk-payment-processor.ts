import { OrderPaymentRequestBody } from '../../../order';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

export interface ProcessorSettings {
    paymentMethod: PPSDKPaymentMethod;
    payment: OrderPaymentRequestBody | undefined;
    bigpayBaseUrl: string;
}

export interface PaymentProcessor {
    process(settings: ProcessorSettings): Promise<void>;
}
