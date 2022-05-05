export type EnvironmentType = 'PRODUCTION' | 'TEST';

export interface AmazonPayV2Options {
    environment: EnvironmentType;
}

export interface AmazonPayV2SDK {
    Pay: AmazonPayV2Client;
}

export interface AmazonPayV2Client {
    /**
     * Render the Amazon Pay button to a HTML container element.
     *
     * @param containerId - HTML element id.
     * @param params - Button rendering params.
     */
    renderButton(containerId: string, params: AmazonPayV2ButtonParams): HTMLElement;

    /**
     * Bind click events to HTML elements, so that when the element is clicked, the buyer can select a different shipping address or payment method.
     *
     * @param buttonId - HTML element id.
     * @param options - Element binding options.
     */
    bindChangeAction(buttonId: string, options: AmazonPayV2ChangeActionOptions): void;

    /**
     * Allow buyers to sign out from their Amazon account.
     */
    signout(): void;
}

export interface AmazonPayV2HostWindow extends Window {
    amazon?: AmazonPayV2SDK;
}

export interface AmazonPayV2ButtonParams {
    /**
     * Amazon Pay merchant account identifier.
     */
    merchantId: string;

    /**
     * Configuration for calling the endpoint to Create Checkout Session.
     */
    createCheckoutSession: AmazonPayV2CheckoutSession;

    /**
     * Placement of the Amazon Pay button on your website.
     */
    placement: AmazonPayV2Placement;

    /**
     * Ledger currency provided during registration for the given merchant identifier.
     */
    ledgerCurrency: AmazonPayV2LedgerCurrency;

    /**
     * Product type selected for checkout. Default is 'PayAndShip'.
     */
    productType?: AmazonPayV2PayOptions;

    /**
     * Language used to render the button and text on Amazon Pay hosted pages.
     */
    checkoutLanguage?: AmazonPayV2CheckoutLanguage;

    /**
     * Sets button to Sandbox environment. Default is false.
     */
    sandbox?: boolean;
}

export interface AmazonPayV2CheckoutSession {
    /**
     * Endpoint URL to Create Checkout Session.
     */
    url: string;

    /**
     * HTTP request method. Default is 'POST'.
     */
    method?: 'GET' | 'POST';

    /**
     * Checkout Session ID parameter in the response. Default is 'checkoutSessionId'.
     */
    extractAmazonCheckoutSessionId?: string;
}

export type AmazonPayV2ChangeActionType = 'changeAddress' | 'changePayment';

export interface AmazonPayV2ChangeActionOptions {
    /**
     * Amazon Pay Checkout Session identifier.
     */
    amazonCheckoutSessionId: string;

    /**
     * Update requested by the buyer.
     */
    changeAction: AmazonPayV2ChangeActionType;
}

export enum AmazonPayV2Regions {
    de = 'eu',
    jp = 'fe',
    uk = 'eu',
    us = 'na',
}

export enum AmazonPayV2CheckoutLanguage {
    en_US = 'en_US',
    en_GB = 'en_GB',
    de_DE = 'de_DE',
    fr_FR = 'fr_FR',
    it_IT = 'it_IT',
    es_ES = 'es_ES',
    ja_JP = 'ja_JP',
}

export enum AmazonPayV2Placement {
    /** Initial or main page. */
    Home = 'Home',

    /** Product details page. */
    Product = 'Product',

    /** Cart review page before buyer starts checkout. */
    Cart = 'Cart',

    /** Any page after buyer starts checkout. */
    Checkout = 'Checkout',

    /** Any page that doesn't fit the previous descriptions. */
    Other = 'Other',
}

export enum AmazonPayV2LedgerCurrency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
}

export enum AmazonPayV2PayOptions {
    /** Select this product type if you need the buyer's shipping details. */
    PayAndShip = 'PayAndShip',

    /** Select this product type if you do not need the buyer's shipping details. */
    PayOnly = 'PayOnly',
}
