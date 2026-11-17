import { PaymentRequestOptions } from './payment-request-options';

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface PaymentInitializeOptions extends PaymentRequestOptions {
    [key: string]: unknown;
}

export interface InitializePaymentOptions {
    authorizationToken?: string;
    customerMessage?: string;
    referenceId?: string;
    useStoreCredit?: boolean;
}
