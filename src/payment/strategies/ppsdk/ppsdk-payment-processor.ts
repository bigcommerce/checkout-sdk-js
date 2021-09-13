import { OrderPaymentRequestBody } from '../../../order';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

export interface ProcessorSettings {
    token: string;
    paymentMethod: PPSDKPaymentMethod;
    payment?: OrderPaymentRequestBody;
    bigpayBaseUrl: string;
}

export interface PaymentProcessor {
    process(settings: ProcessorSettings): Promise<void>;
}
