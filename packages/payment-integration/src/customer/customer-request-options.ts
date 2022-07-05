import { RequestOptions } from "@bigcommerce/request-sender";
import { ApplePayCustomerWalletButtonInitializeOptions } from "../strategy/wallet-button-initialize-options";

export interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

export interface CustomerInitializeOptions extends CustomerRequestOptions {
    applepay?: ApplePayCustomerWalletButtonInitializeOptions;
}


export interface ExecutePaymentMethodCheckoutOptions extends CustomerRequestOptions {
    continueWithCheckoutCallback?(): void;
}
