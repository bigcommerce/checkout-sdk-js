export type EnvironmentType = 'PRODUCTION' | 'TEST';

export interface AmazonMaxoOptions {
    environment: EnvironmentType;
}

export interface AmazonMaxoSDK {
    Pay: AmazonMaxoClient;
}

export interface AmazonMaxoClient {
    renderButton(containerId: string, params: AmazonMaxoButtonParams): HTMLElement;
    bindChangeAction(): void;
}

export interface AmazonMaxoHostWindow extends Window {
    amazon?: AmazonMaxoSDK;
}

export interface AmazonMaxoButtonParams {
    merchantId: string;
    createCheckoutSession: AmazonMaxoCheckoutSession;
    placement: AmazonMaxoPlacement;
    ledgerCurrency: AmazonMaxoLedgerCurrency;
    productType?: string;
    checkoutLanguage?: AmazonMaxoCheckoutLanguage;
    sandbox?: boolean;
}

export interface AmazonMaxoCheckoutSession {
    url: string;
    method?: string;
    extractAmazonCheckoutSessionId?: string;
}

export enum AmazonMaxoRegions {
    de = 'eu',
    jp = 'fe',
    uk = 'eu',
    us = 'na',
}

export enum AmazonMaxoCheckoutLanguage {
    es_ES = 'es_ES',
    en_GB = 'en_GB',
    en_US = 'en_US',
    de_DE = 'de_DE',
    fr_FR = 'fr_FR',
    it_IT = 'it_IT',
    ja_JP = 'ja_JP',
}

export enum AmazonMaxoPlacement {
    Home = 'Home',
    Product = 'Product',
    Cart = 'Cart',
    Checkout = 'Checkout',
    Other = 'Other',
}

export enum AmazonMaxoLedgerCurrency {
    eu = 'EUR',
    jp = 'JPY',
    uk = 'GBP',
    us = 'USD',
}
