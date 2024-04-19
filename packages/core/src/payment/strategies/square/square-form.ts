import { NonceInstrument } from '../../payment';

export default interface SquarePaymentForm {
    build(): void;
    requestCardNonce(): void;
    setPostalCode(postalCode: string): void;
    verifyBuyer(
        source?: string,
        verificationDetails?: VerificationDetails,
        callback?: VerifyBuyerResponse,
    ): void;
}

export type VerifyBuyerResponse = (
    errors: SquareVerificationError,
    verificationResult: SquareVerificationResult,
) => void;

export interface SquareVerificationError {
    type: string;
    message: string;
}

export interface SquareVerificationResult {
    token: string;
    userChallenged: boolean;
}

export enum SquareIntent {
    CHARGE = 'CHARGE',
    STORE = 'STORE',
}

export interface VerificationDetails {
    intent: string;
    amount?: string;
    currencyCode?: string;
    billingContact?: Contact;
}

export type SquarePaymentFormConstructor = new (options: SquareFormOptions) => SquarePaymentForm;

export type SquareScriptCallBack = (options: SquareFormOptions) => SquarePaymentForm;

export interface SquareFormOptions {
    applicationId: string;
    env: string;
    locationId: string;
    inputClass?: string;
    inputStyles?: string[];
    callbacks?: SquareFormCallbacks;
    cardNumber: SquareFormElement;
    cvv: SquareFormElement;
    expirationDate: SquareFormElement;
    postalCode: SquareFormElement;
}
export interface LineItem {
    label: string;
    amount: string;
    pending: boolean;
}

export interface SquarePaymentRequest {
    requestShippingAddress: boolean;
    requestBillingInfo: boolean;
    shippingContact?: Contact;
    countryCode: string;
    currencyCode: string;
    lineItems?: LineItem[];
    total: LineItem;
}

export interface NonceGenerationError {
    type: string;
    message: string;
    field: string;
}

export interface CardData {
    card_brand: CardBrand;
    last_4: number;
    exp_month: number;
    exp_year: number;
    billing_postal_code: string;
    digital_wallet_type: DigitalWalletType;
}

export interface Contact {
    familyName: string;
    givenName: string;
    email: string;
    country: string;
    countryName: string;
    region: string;
    city: string;
    addressLines: string[];
    postalCode: string;
    phone: string;
}

export enum CardBrand {
    americanExpress = 'AMERICAN_EXPRESS',
    discover = 'DISCOVER',
    discoverDiners = 'DISCOVER_DINERS',
    JCB = 'JCB',
    masterCard = 'MASTERCARD',
    unionPay = 'CHINA_UNIONPAY',
    unknown = 'OTHER_BRAND',
    visa = 'VISA',
    squareGift = 'SQUARE_GIFT_CARD',
}

export enum DigitalWalletType {
    applePay = 'APPLEPAY',
    none = 'NONE',
}

/**
 * Configures any form element provided by Square payment.
 */
export interface SquareFormElement {
    /**
     * The ID of the container which the form element should insert into.
     */
    elementId: string;

    /**
     * The placeholder text to use for the form element, if provided.
     */
    placeholder?: string;
}

export interface SquareFormCallbacks {
    paymentFormLoaded?(form: SquarePaymentForm): void;
    unsupportedBrowserDetected?(): void;
    cardNonceResponseReceived?(
        errors?: NonceGenerationError[],
        nonce?: string,
        cardData?: CardData,
        billingContact?: Contact,
        shippingContact?: Contact,
    ): void;
    methodsSupported?(methods: { [key: string]: boolean }): void;
    createPaymentRequest?(): void;
}

export type SquareFormFactory = (options: SquareFormOptions) => SquarePaymentForm;

export interface DeferredPromise {
    resolve(resolution?: SquareNonceInstrument): void;
    reject(reason?: any): void;
}

export interface SquareNonceInstrument extends NonceInstrument {
    token?: string;
}
