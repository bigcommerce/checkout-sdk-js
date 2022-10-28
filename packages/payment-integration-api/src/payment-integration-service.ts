import { BillingAddressRequestBody } from "./billing";
import { OrderRequestBody } from "./order";
import { Payment } from "./payment";
import PaymentIntegrationSelectors from "./payment-integration-selectors";
import { RequestOptions } from "./util-types";
import { ShippingAddressRequestBody } from "./shipping";

export default interface PaymentIntegrationService {
    subscribe(
        subscriber: (state: PaymentIntegrationSelectors) => void,
        ...filters: Array<(state: PaymentIntegrationSelectors) => unknown>
    ): () => void;

    getState(): PaymentIntegrationSelectors;

    loadCheckout(): Promise<PaymentIntegrationSelectors>;

    loadDefaultCheckout(): Promise<PaymentIntegrationSelectors>;

    loadPaymentMethod(methodId: string): Promise<PaymentIntegrationSelectors>;

    loadCurrentOrder(): Promise<PaymentIntegrationSelectors>;

    submitOrder(
        payload?: OrderRequestBody,
        options?: RequestOptions
    ): Promise<PaymentIntegrationSelectors>;

    submitPayment(payment: Payment): Promise<PaymentIntegrationSelectors>;

    finalizeOrder(): Promise<PaymentIntegrationSelectors>;

    selectShippingOption(
        id: string,
        options?: RequestOptions
    ): Promise<PaymentIntegrationSelectors>;

    updateBillingAddress(
        payload: BillingAddressRequestBody
    ): Promise<PaymentIntegrationSelectors>;

    updateShippingAddress(
        payload: ShippingAddressRequestBody
    ): Promise<PaymentIntegrationSelectors>;
}
