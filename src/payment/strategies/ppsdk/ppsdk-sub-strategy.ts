import { OrderPaymentRequestBody } from '../../../order';

export interface SubStrategySettings {
    token: string;
    methodId: string;
    payment?: OrderPaymentRequestBody;
    bigpayBaseUrl: string;
}

export interface SubStrategy {
    process(settings: SubStrategySettings): Promise<void>;
}
