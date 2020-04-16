export type EnvironmentType = 'PRODUCTION' | 'TEST';

export interface AmazonPayv2Options {
    environment: EnvironmentType;
}

export interface AmazonPayv2SDK {
    Pay: AmazonPayv2Client;
}

export interface AmazonPayv2Client {
    renderButton(containerId: string, params: AmazonPayv2ButtonParams): HTMLElement;
    bindChangeAction(): void;
}

export interface AmazonPayv2HostWindow extends Window {
    amazon?: AmazonPayv2SDK;
}

export interface AmazonPayv2ButtonParams {
    merchantId: string;
    createCheckoutSession: AmazonPayv2CheckoutSession;
    placement: AmazonPayv2Placement;
    ledgerCurrency: AmazonPayv2LedgerCurrency;
    productType?: string;
    checkoutLanguage?: AmazonPayv2CheckoutLanguage;
    sandbox?: boolean;
}

export interface AmazonPayv2CheckoutSession {
    url: string;
    method?: string;
    extractAmazonCheckoutSessionId?: string;
}

export enum AmazonPayv2Regions {
    de = 'eu',
    jp = 'fe',
    uk = 'eu',
    us = 'na',
}

export enum AmazonPayv2CheckoutLanguage {
    es_ES = 'es_ES',
    en_GB = 'en_GB',
    en_US = 'en_US',
    de_DE = 'de_DE',
    fr_FR = 'fr_FR',
    it_IT = 'it_IT',
    ja_JP = 'ja_JP',
}

export enum AmazonPayv2Placement {
    Home = 'Home',
    Product = 'Product',
    Cart = 'Cart',
    Checkout = 'Checkout',
    Other = 'Other',
}

export enum AmazonPayv2LedgerCurrency {
    eu = 'EUR',
    jp = 'JPY',
    uk = 'GBP',
    us = 'USD',
}
