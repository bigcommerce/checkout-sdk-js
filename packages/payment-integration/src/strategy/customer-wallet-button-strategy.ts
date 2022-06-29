import { CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, ExecutePaymentMethodCheckoutOptions } from '../customer';

import PaymentIntegrationSelectors from '../payment-integration-selectors';

export default interface CustomerWalletButtonStrategy {
    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<PaymentIntegrationSelectors>;

    signOut(options?: CustomerRequestOptions): Promise<PaymentIntegrationSelectors>;

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<PaymentIntegrationSelectors>;

    initialize(options?: CustomerInitializeOptions): Promise<PaymentIntegrationSelectors>;

    deinitialize(options?: CustomerRequestOptions): Promise<PaymentIntegrationSelectors>;
}
