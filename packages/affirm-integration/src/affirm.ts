export interface Affirm {
    checkout: AffirmCheckout;
    ui: {
        error: {
            on(event: string, callback: () => void): void;
        };
        ready(callback: () => void): void;
    };
}

export interface AffirmCheckout {
    (options: AffirmRequestData): void;
    open(modalOptions: AffirmCallback): void;
    init(): void;
}

interface AffirmCallback {
    onFail(onFail: AffirmFailResponse): void;
    onSuccess(success: AffirmSuccessResponse): void;
}

export interface AffirmConfig {
    public_api_key: string;
    script: string;
    locale: string;
    country_code: string;
}

export interface AffirmHostWindow extends Window {
    affirm?: Affirm;
    _affirm_config?: AffirmConfig;
}

export type AffirmCountryCode = 'USA' | 'CAN' | 'GBR';

export interface AffirmInitializationData {
    countryCode?: AffirmCountryCode;
    locale?: string;
    currency?: string;
    postponeOrderCreation?: boolean;
}

export interface AffirmSuccessResponse {
    checkout_token: string;
    created: string;
}

export interface AffirmFailResponse {
    reason: string;
}

export interface AffirmRequestData {
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
    currency: string;
}

export interface AffirmItem {
    display_name: string;
    sku: string;
    unit_price: number;
    qty: number;
    item_image_url: string;
    item_url: string;
    categories?: string[][];
}

export type AffirmDiscount = Record<
    string,
    {
        discount_amount: number;
        discount_display_name: string;
    }
>;

export interface AffirmAddress {
    name: {
        first: string;
        last: string;
        full?: string;
    };
    address: {
        street1: string;
        street2?: string;
        city: string;
        region1_code?: string;
        postal_code: string;
        country_code: string;
    };
    phone_number?: string;
    email?: string;
}

export enum AFFIRM_SCRIPTS {
    PROD = '//cdn1.affirm.com/js/v2/affirm.js',
    SANDBOX = '//cdn1-sandbox.affirm.com/js/v2/affirm.js',
}
