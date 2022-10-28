import {
    OrderPaymentRequestBody,
    PaymentAdditionalAction,
    PaymentInitializeOptions,
    PaymentRequestOptions
} from "@bigcommerce/checkout-sdk/payment-integration-api";

export interface SubStrategySettings {
    additionalAction?: PaymentAdditionalAction;
    token: string;
    methodId: string;
    payment?: OrderPaymentRequestBody;
    bigpayBaseUrl: string;
}

export interface SubStrategy {
    execute(settings: SubStrategySettings): Promise<void>;

    initialize(options?: PaymentInitializeOptions): Promise<void>;

    deinitialize(options?: PaymentRequestOptions): void;
}
