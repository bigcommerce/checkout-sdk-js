import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../customer';

export default interface CustomerStrategy {
    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<void>;

    signOut(options?: CustomerRequestOptions): Promise<void>;

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;

    initialize(options?: CustomerInitializeOptions): Promise<void>;

    deinitialize(options?: CustomerRequestOptions): Promise<void>;
}
