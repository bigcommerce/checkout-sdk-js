import { InternalCheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';
import { PaymentFinalizeOptions, PaymentInitializeOptions, PaymentRequestOptions } from '../payment-request-options';

export default interface PaymentStrategy {
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>;

    finalize(options?: PaymentFinalizeOptions): Promise<InternalCheckoutSelectors>;

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors>;

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>;
}
