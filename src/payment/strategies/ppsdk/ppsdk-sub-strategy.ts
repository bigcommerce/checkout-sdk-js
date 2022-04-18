import { OrderPaymentRequestBody } from '../../../order';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';

export interface SubStrategySettings {
    token: string;
    methodId: string;
    payment?: OrderPaymentRequestBody;
    bigpayBaseUrl: string;
}

export interface SubStrategy {
    execute(settings: SubStrategySettings): Promise<void>;

    initialize(options?: PaymentInitializeOptions): Promise<void>;

    deinitialize(options?: PaymentRequestOptions): void;
}
