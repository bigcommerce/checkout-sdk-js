import { RequestOptions } from '@bigcommerce/request-sender';

export interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

export interface CustomerInitializeOptions extends CustomerRequestOptions {
    [key: string]: unknown;
}

export interface ExecutePaymentMethodCheckoutOptions extends CustomerRequestOptions {
    email?: string;
    checkoutPaymentMethodExecuted?(data?: CheckoutPaymentMethodExecutedOptions): void;
    continueWithCheckoutCallback?(): void;
}

export interface CheckoutPaymentMethodExecutedOptions {
    hasBoltAccount?: boolean;
}
