import { BillingAddressRequestBody,
    OrderRequestBody,
    Payment,
    ShippingAddressRequestBody } from '@bigcommerce/checkout-sdk/core';

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
