import { CheckoutStore } from '../../../../checkout';
import { OrderPaymentRequestBody } from '../../../../order';
import { PaymentInitializeOptions } from '../../../payment-request-options';

export type PaymentProcessor = (paymentRequest?: OrderPaymentRequestBody) => Promise<Response>;

interface IntializerConfig {
    store: CheckoutStore;
    options: PaymentInitializeOptions;
}

export type Initializer = (config: IntializerConfig) => Promise<PaymentProcessor>;
