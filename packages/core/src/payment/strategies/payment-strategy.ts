import { InternalCheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../payment-request-options';

export default interface PaymentStrategy {
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>;

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>;

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors>;

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>;
}
