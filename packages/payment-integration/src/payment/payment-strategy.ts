import { OrderRequestBody } from '../order';
import PaymentIntegrationSelectors from '../payment-integration-selectors';
import { PaymentInitializeOptions } from './payment-initialize-options';
import { PaymentRequestOptions } from './payment-request-options';

export default interface PaymentStrategy {
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<PaymentIntegrationSelectors>;

    finalize(options?: PaymentRequestOptions): Promise<PaymentIntegrationSelectors>;

    initialize(options?: PaymentInitializeOptions): Promise<PaymentIntegrationSelectors>;

    deinitialize(options?: PaymentRequestOptions): Promise<PaymentIntegrationSelectors>;
}
