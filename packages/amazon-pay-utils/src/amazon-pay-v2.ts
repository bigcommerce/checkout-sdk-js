import {
    Cart,
    Checkout,
    PaymentMethod,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export type EnvironmentType = 'PRODUCTION' | 'TEST';

export interface AmazonPayV2Options {
    environment: EnvironmentType;
}

export interface AmazonPayV2SDK {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Pay: AmazonPayV2Client;
}

export interface RequestConfig {
    createCheckoutSessionConfig: AmazonPayV2CheckoutSessionConfig;
    estimatedOrderAmount?: AmazonPayV2Price;
    productType?: AmazonPayV2PayOptions;
}

export interface AmazonPayV2Button {
    /**
     * Allows you to define custom actions.
     */
    onClick: (callback: () => void | Promise<void>) => void;

    /**
     * Initiates the Amazon Pay checkout.
     */
    initCheckout(requestConfig: RequestConfig): void;
}

export type AmazonPayV2ButtonParameters = AmazonPayV2ButtonParams | AmazonPayV2NewButtonParams;

export interface AmazonPayV2Client {
    /**
     * Render the Amazon Pay button to a HTML container element.
     *
     * @param containerId - HTML element id.
     * @param params - Button rendering params.
     */
    renderButton(containerId: string, params: AmazonPayV2ButtonParameters): AmazonPayV2Button;

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

export interface AmazonPayV2ButtonConfig {
    /**
     * Amazon Pay merchant account identifier.
     */
    merchantId: string;

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
     * Color of the Amazon Pay button.
     */
    buttonColor?: AmazonPayV2ButtonColor;

    /**
     * Language used to render the button and text on Amazon Pay hosted pages.
     */
    checkoutLanguage?: AmazonPayV2CheckoutLanguage;

    /**
     * Sets button to Sandbox environment. You do not have to set this parameter
     * if your `publicKeyId` has an environment prefix. Default is false.
     */
    sandbox?: boolean;

    /**
     * Sets Amazon Pay button design.
     */
    design?: AmazonPayV2ButtonDesign;
}

export interface AmazonPayV2ButtonParams extends AmazonPayV2ButtonConfig {
    /**
     * Configuration for calling the endpoint to Create Checkout Session.
     */
    createCheckoutSession: AmazonPayV2CheckoutSession;
}

export interface AmazonPayV2NewButtonParams extends AmazonPayV2ButtonConfig {
    /**
     * Credential provided by Amazon Pay. You must also set the `sandbox`
     * parameter if your `publicKeyId` does not have an environment prefix.
     */
    publicKeyId?: string;

    /**
     * It does not have to match the final order amount if the buyer updates
     * their order after starting checkout. Amazon Pay will use this value to
     * assess transaction risk and prevent buyers from selecting payment methods
     * that can't be used to process the order.
     */
    estimatedOrderAmount?: AmazonPayV2Price;

    /**
     * Create Checkout Session configuration.
     */
    createCheckoutSessionConfig?: AmazonPayV2CheckoutSessionConfig;
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

export interface AmazonPayV2CheckoutSessionConfig {
    /**
     * A payload that Amazon Pay will use to create a Checkout Session object.
     */
    payloadJSON: string;

    /**
     * Payload's signature.
     */
    signature: string;

    /**
     * Credential provided by Amazon Pay. You do not have to set this parameter
     * if your `publicKeyId` has an environment prefix.
     */
    publicKeyId?: string;
}

export interface AmazonPayV2Price {
    /**
     * Transaction amount.
     */
    amount: string;

    /**
     * Transaction currency code in ISO 4217 format. Example: USD.
     */
    currencyCode: string;
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

export const amazonPayV2Regions: { [key: string]: string } = {
    de: 'eu',
    jp: 'fe',
    uk: 'eu',
    us: 'na',
};

/* eslint-disable @typescript-eslint/naming-convention */
export enum AmazonPayV2CheckoutLanguage {
    en_US = 'en_US',
    en_GB = 'en_GB',
    de_DE = 'de_DE',
    fr_FR = 'fr_FR',
    it_IT = 'it_IT',
    es_ES = 'es_ES',
    ja_JP = 'ja_JP',
}
/* eslint-enable @typescript-eslint/naming-convention */

/* eslint-disable @typescript-eslint/no-shadow */
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
/* eslint-enable @typescript-eslint/no-shadow */

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

export enum AmazonPayV2ButtonColor {
    Gold = 'Gold',
    LightGray = 'LightGray',
    DarkGray = 'DarkGray',
}

export enum AmazonPayV2ButtonDesign {
    C0001 = 'C0001',
}

// TODO: after migration AmazonPay strategies to integration package
// <InternalCheckoutSelectors> should be removed
// and replaced usage with <PaymentIntegrationService>
export interface InternalCheckoutSelectors {
    cart: {
        getCart: () => Cart | undefined;
    };
    checkout: {
        getCheckout: () => Checkout | undefined;
    };
    config: {
        getStoreConfigOrThrow: () => StoreConfig;
    };
    paymentMethods: {
        getPaymentMethodOrThrow: (methodId: string) => PaymentMethod<AmazonPayV2InitializeOptions>;
    };
}

export interface AmazonPayV2InitializeOptions {
    buttonColor?: AmazonPayV2ButtonColor;
    checkoutLanguage?: AmazonPayV2CheckoutLanguage;
    checkoutSessionMethod?: 'GET' | 'POST';
    createCheckoutSessionConfig?: AmazonPayV2CheckoutSessionConfig;
    extractAmazonCheckoutSessionId?: string;
    ledgerCurrency?: AmazonPayV2LedgerCurrency;
    publicKeyId?: string;
    region?: string;
    isButtonMicroTextDisabled?: boolean;
}

export interface AmazonPayV2ButtonRenderingOptions {
    checkoutState: InternalCheckoutSelectors;
    containerId: string;
    decoupleCheckoutInitiation?: boolean;
    methodId: string;
    buttonColor?: AmazonPayV2ButtonColor;
    options?: AmazonPayV2ButtonParameters;
    placement: AmazonPayV2Placement;
    isButtonMicroTextDisabled?: boolean;
}
