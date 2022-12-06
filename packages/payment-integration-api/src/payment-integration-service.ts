import { BillingAddressRequestBody } from "./billing";
import { HostedForm, HostedFormOptions } from "./hosted-form";
import { OrderRequestBody } from "./order";
import { Payment } from "./payment";
import PaymentIntegrationSelectors from "./payment-integration-selectors";
import { RequestOptions } from "./util-types";
import { ShippingAddressRequestBody } from "./shipping";
import { BuyNowCartRequestBody } from "./cart/buyNowCart";
import { Response } from "@bigcommerce/request-sender";
import { Cart } from "./cart";

export default interface PaymentIntegrationService {
    createHostedForm(
        host: string,
        options: HostedFormOptions
    ): HostedForm;

    createBuyNowCart(
        body: BuyNowCartRequestBody,
    ): Promise<Response<Cart>> ;

    subscribe(
        subscriber: (state: PaymentIntegrationSelectors) => void,
        ...filters: Array<(state: PaymentIntegrationSelectors) => unknown>
    ): () => void;

    getState(): PaymentIntegrationSelectors;

    loadCheckout(): Promise<PaymentIntegrationSelectors>;

    loadDefinedCheckout(cartID: string): Promise<PaymentIntegrationSelectors>;

    loadDefaultCheckout(): Promise<PaymentIntegrationSelectors>;

    loadPaymentMethod(methodId: string): Promise<PaymentIntegrationSelectors>;

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
