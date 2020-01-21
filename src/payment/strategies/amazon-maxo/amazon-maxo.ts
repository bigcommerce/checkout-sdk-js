export type EnvironmentType = 'PRODUCTION' | 'TEST';

export interface AmazonMaxoOptions {
    environment: EnvironmentType;
}

export interface AmazonMaxoSDK {
    Pay: AmazonMaxoClient
}

export interface AmazonMaxoClient {
    renderButton(containerId: HTMLElement, params: AmazonMaxoButtonParams): HTMLElement;
    bindChangeAction(): null
}

export interface AmazonMaxoHostWindow extends Window {
    amazon?: AmazonMaxoSDK;
}

export interface AmazonMaxoButtonParams {
    merchantId: string;
    createCheckoutSession: AmazonMaxoCheckoutSession,
    placement: AmazonMaxoPlacement,
    ledgerCurrency: AmazonMaxoLedgerCurrency,
    productType?: string,
    checkoutLanguage?: AmazonMaxoCheckoutLanguage,
    sandbox?: boolean
}

export interface AmazonMaxoCheckoutSession {
    url: string;
    method?: string;
    extractAmazonCheckoutSessionId?: string;
}

export enum AmazonMaxoRegions {
    eu = 'eu',
    jp = 'fe',
    uk = 'eu',
    us = 'na',
}

export enum AmazonMaxoCheckoutLanguage {
    en_US = 'en_US',
    en_GB = 'en_GB',
    de_DE = 'de_DE',
    fr_FR = 'fr_FR',
    it_IT = 'it_IT',
    es_ES = 'es_ES',
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
