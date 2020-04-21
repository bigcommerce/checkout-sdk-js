export type EnvironmentType = 'PRODUCTION' | 'TEST';

export interface AmazonPayV2Options {
    environment: EnvironmentType;
}

export interface AmazonPayV2SDK {
    Pay: AmazonPayV2Client;
}

export interface AmazonPayV2Client {
    renderButton(containerId: string, params: AmazonPayV2ButtonParams): HTMLElement;
    bindChangeAction(buttonId: string, options: AmazonPayV2ChangeActionOptions): void;
    signout(): void;
}

export interface AmazonPayV2HostWindow extends Window {
    amazon?: AmazonPayV2SDK;
}

export interface AmazonPayV2ButtonParams {
    merchantId: string;
    createCheckoutSession: AmazonPayV2CheckoutSession;
    placement: AmazonPayV2Placement;
    ledgerCurrency: AmazonPayV2LedgerCurrency;
    productType?: string;
    checkoutLanguage?: AmazonPayV2CheckoutLanguage;
    sandbox?: boolean;
}

export interface AmazonPayV2CheckoutSession {
    url: string;
    method?: string;
    extractAmazonCheckoutSessionId?: string;
}

export type AmazonPayV2ChangeActionType = 'changeAddress' | 'changePayment';

export interface AmazonPayV2ChangeActionOptions {
    amazonCheckoutSessionId: string;
    changeAction: AmazonPayV2ChangeActionType;
}

export enum AmazonPayV2Regions {
    de = 'eu',
    jp = 'fe',
    uk = 'eu',
    us = 'na',
}

export enum AmazonPayV2CheckoutLanguage {
    es_ES = 'es_ES',
    en_GB = 'en_GB',
    en_US = 'en_US',
    de_DE = 'de_DE',
    fr_FR = 'fr_FR',
    it_IT = 'it_IT',
    ja_JP = 'ja_JP',
}

export enum AmazonPayV2Placement {
    Home = 'Home',
    Product = 'Product',
    Cart = 'Cart',
    Checkout = 'Checkout',
    Other = 'Other',
}

export enum AmazonPayV2LedgerCurrency {
    eu = 'EUR',
    jp = 'JPY',
    uk = 'GBP',
    us = 'USD',
}

export enum AmazonPayV2PayOptions {
    PayAndShip = 'PayAndShip',
    PayOnly = 'PayOnly',
}
