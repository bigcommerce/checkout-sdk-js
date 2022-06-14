import { BillingAddressRequestBody } from '../billing';
import { OrderRequestBody } from '../order';
import Payment from '../payment/payment';
import { ShippingAddressRequestBody } from '../shipping';
import PaymentIntegrationSelectors from './payment-integration-selectors';

export default interface PaymentIntegrationService {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    subscribe(subscriber: (state: PaymentIntegrationSelectors) => void, ...filters: Array<(state: PaymentIntegrationSelectors) => any>): () => void;

    getState(): PaymentIntegrationSelectors;

    loadCheckout(): Promise<PaymentIntegrationSelectors>;

    loadPaymentMethod(methodId: string): Promise<PaymentIntegrationSelectors>;

    submitOrder(payload?: OrderRequestBody): Promise<PaymentIntegrationSelectors>;

    submitPayment(payment: Payment): Promise<PaymentIntegrationSelectors>;

    finalizeOrder(): Promise<PaymentIntegrationSelectors>;

    updateBillingAddress(payload: BillingAddressRequestBody): Promise<PaymentIntegrationSelectors>;

    updateShippingAddress(payload: ShippingAddressRequestBody): Promise<PaymentIntegrationSelectors>;
}
