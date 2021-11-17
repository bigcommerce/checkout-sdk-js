import { OrderPaymentRequestBody } from '../../../order';

export interface ProcessorSettings {
    token: string;
    methodId: string;
    payment?: OrderPaymentRequestBody;
    bigpayBaseUrl: string;
}

export interface PaymentProcessor {
    process(settings: ProcessorSettings): Promise<void>;
}
