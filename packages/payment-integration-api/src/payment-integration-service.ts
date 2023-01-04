import { BillingAddressRequestBody } from './billing';
import { CustomerCredentials } from './customer';
import { HostedForm, HostedFormOptions } from './hosted-form';
import { OrderRequestBody } from './order';
import { InitializeOffsitePaymentConfig, Payment } from './payment';
import PaymentIntegrationSelectors from './payment-integration-selectors';
import { ShippingAddressRequestBody } from './shipping';
import { RequestOptions } from './util-types';

export default interface PaymentIntegrationService {
    createHostedForm(host: string, options: HostedFormOptions): HostedForm;

    subscribe(
        subscriber: (state: PaymentIntegrationSelectors) => void,
        ...filters: Array<(state: PaymentIntegrationSelectors) => unknown>
    ): () => void;

    getState(): PaymentIntegrationSelectors;

    initializeOffsitePayment(
        initializeOffsitePaymentConfig: InitializeOffsitePaymentConfig,
    ): Promise<PaymentIntegrationSelectors>;

    loadCheckout(): Promise<PaymentIntegrationSelectors>;

    loadDefaultCheckout(): Promise<PaymentIntegrationSelectors>;

    loadPaymentMethod(methodId: string): Promise<PaymentIntegrationSelectors>;

    submitOrder(
        payload?: OrderRequestBody,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    submitPayment(payment: Payment): Promise<PaymentIntegrationSelectors>;

    finalizeOrder(options?: RequestOptions): Promise<PaymentIntegrationSelectors>;

    selectShippingOption(
        id: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    updateBillingAddress(payload: BillingAddressRequestBody): Promise<PaymentIntegrationSelectors>;

    updateShippingAddress(
        payload: ShippingAddressRequestBody,
    ): Promise<PaymentIntegrationSelectors>;

    signInCustomer(
        credentials: CustomerCredentials,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    signOutCustomer(options?: RequestOptions): Promise<PaymentIntegrationSelectors>;
}
