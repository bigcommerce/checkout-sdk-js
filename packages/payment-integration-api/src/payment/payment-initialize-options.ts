import { PaymentRequestOptions } from './payment-request-options';

export interface PaymentInitializeOptions extends PaymentRequestOptions {
    [key: string]: unknown;
}

export interface InitializePaymentOptions {
    authorizationToken?: string;
    customerMessage?: string;
    referenceId?: string;
    useStoreCredit?: boolean;
}
