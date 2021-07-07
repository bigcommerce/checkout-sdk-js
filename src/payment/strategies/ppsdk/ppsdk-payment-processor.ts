import { OrderPaymentRequestBody } from '../../../order';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

export interface ProcessorSettings {
    paymentMethod?: PPSDKPaymentMethod;
    payment?: OrderPaymentRequestBody;
    bigpayBaseUrl: string;
    paymentId?: string;
}

export interface PaymentProcessor {
    process(settings: ProcessorSettings): Promise<void>;
}
