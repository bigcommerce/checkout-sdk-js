import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare interface Affirm {
    checkout: AffirmCheckout;
    ui: {
        error: {
            on(event: string, callback: () => void): void;
        };
        ready(callback: () => void): void;
    };
}

declare interface AffirmAddress {
    name: {
        first: string;
        last: string;
        full?: string;
    };
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zipcode: string;
        country?: string;
    };
    phone_number?: string;
    email?: string;
}

declare interface AffirmCallback {
    onFail(onFail: AffirmFailResponse): void;
    onSuccess(success: AffirmSuccessResponse): void;
}

declare interface AffirmCheckout {
    (options: AffirmRequestData): void;
    open(modalOptions: AffirmCallback): void;
    init(): void;
}

declare interface AffirmDiscount {
    [key: string]: {
        discount_amount: number;
        discount_display_name: string;
    };
}

declare interface AffirmFailResponse {
    reason: string;
}

declare interface AffirmHostWindow extends Window {
    affirm?: Affirm;
}

declare interface AffirmItem {
    display_name: string;
    sku: string;
    unit_price: number;
    qty: number;
    item_image_url: string;
    item_url: string;
    categories?: string[][];
}

declare class AffirmPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private affirmScriptLoader;
    private affirm?;
    constructor(paymentIntegrationService: PaymentIntegrationService, affirmScriptLoader: AffirmScriptLoader);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    deinitialize(): Promise<void>;
    finalize(): Promise<void>;
    private initializeAffirmCheckout;
    private getCheckoutInformation;
    private getShippingType;
    private getBillingAddress;
    private getShippingAddress;
    private getItems;
    private getDiscounts;
    private getCategories;
}

declare interface AffirmRequestData {
    merchant: {
        user_confirmation_url: string;
        user_cancel_url: string;
        user_confirmation_url_action?: string;
        name?: string;
    };
    shipping: AffirmAddress;
    billing?: AffirmAddress;
    items: AffirmItem[];
    discounts: AffirmDiscount;
    metadata: {
        shipping_type: string;
        entity_name?: string;
        webhook_session_id?: string;
        mode?: string;
        platform_type: string;
        platform_version: string;
        platform_affirm: string;
    };
    order_id?: string;
    shipping_amount: number;
    tax_amount: number;
    total: number;
}

declare class AffirmScriptLoader {
    affirmWindow: AffirmHostWindow;
    constructor(affirmWindow?: AffirmHostWindow);
    load(apikey?: string, testMode?: boolean): Promise<Affirm>;
}

declare interface AffirmSuccessResponse {
    checkout_token: string;
    created: string;
}

export declare const createAffirmPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AffirmPaymentStrategy>, {
    id: string;
}>;
