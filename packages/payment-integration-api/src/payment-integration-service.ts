import { BillingAddressRequestBody } from './billing';
import { BuyNowCartRequestBody, Cart } from './cart';
import { Checkout } from './checkout';
import { CustomerCredentials } from './customer';
import { HostedForm, HostedFormOptions } from './hosted-form';
import { OrderRequestBody } from './order';
import { InitializeOffsitePaymentConfig, Payment, PaymentAdditionalAction } from './payment';
import PaymentIntegrationSelectors from './payment-integration-selectors';
import { PaymentProviderCustomer } from './payment-provider-customer';
import { InitializePaymentOptions } from './payment/payment-initialize-options';
import { ShippingAddressRequestBody } from './shipping';
import { RequestOptions } from './util-types';

export default interface PaymentIntegrationService {
    createHostedForm(host: string, options: HostedFormOptions): HostedForm;

    deleteConsignment(
        consignmentId: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    subscribe(
        subscriber: (state: PaymentIntegrationSelectors) => void,
        ...filters: Array<(state: PaymentIntegrationSelectors) => unknown>
    ): () => void;

    getState(): PaymentIntegrationSelectors;

    initializeOffsitePayment(
        initializeOffsitePaymentConfig: InitializeOffsitePaymentConfig,
    ): Promise<PaymentIntegrationSelectors>;

    loadCheckout(id?: string): Promise<PaymentIntegrationSelectors>;

    loadDefaultCheckout(): Promise<PaymentIntegrationSelectors>;

    loadPaymentMethod(
        methodId: string,
        options?: RequestOptions & { useCache?: boolean },
    ): Promise<PaymentIntegrationSelectors>;

    loadPaymentMethods(options?: RequestOptions): Promise<PaymentIntegrationSelectors>;

    loadCurrentOrder(options?: RequestOptions): Promise<PaymentIntegrationSelectors>;

    submitOrder(
        payload?: OrderRequestBody,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    submitPayment<T = unknown>(payment: Payment<T>): Promise<PaymentIntegrationSelectors>;

    finalizeOrder(options?: RequestOptions): Promise<PaymentIntegrationSelectors>;

    selectShippingOption(
        id: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    verifyCheckoutSpamProtection(): Promise<PaymentIntegrationSelectors>;

    updateBillingAddress(payload: BillingAddressRequestBody): Promise<PaymentIntegrationSelectors>;

    updateShippingAddress(
        payload: ShippingAddressRequestBody,
    ): Promise<PaymentIntegrationSelectors>;

    signInCustomer(
        credentials: CustomerCredentials,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    signOutCustomer(options?: RequestOptions): Promise<PaymentIntegrationSelectors>;

    applyStoreCredit(
        useStoreCredit: boolean,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    createBuyNowCart(body: BuyNowCartRequestBody, options?: RequestOptions): Promise<Cart>;

    updatePaymentProviderCustomer(
        paymentProviderCustomer: PaymentProviderCustomer,
    ): Promise<PaymentIntegrationSelectors>;

    loadShippingCountries(options?: RequestOptions): Promise<PaymentIntegrationSelectors>;

    initializePayment(
        methodId: string,
        params?: InitializePaymentOptions,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    forgetCheckout(
        methodId: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors>;

    validateCheckout(checkout?: Checkout, options?: RequestOptions): Promise<void>;

    handlePaymentHumanVerification(
        errorOrId: Error | string,
        key?: string,
    ): Promise<PaymentAdditionalAction>;
}
