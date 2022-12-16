import { OrderRequestBody } from '../order';

import { PaymentInitializeOptions } from './payment-initialize-options';
import { PaymentRequestOptions } from './payment-request-options';

export default interface PaymentStrategy {
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;

    finalize(options?: PaymentRequestOptions): Promise<void>;

    initialize(options?: PaymentInitializeOptions): Promise<void>;

    deinitialize(options?: PaymentRequestOptions): Promise<void>;
}
