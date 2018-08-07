export default interface SquarePaymentForm {
    build(): void;
    requestCardNonce(): void;
    setPostalCode(postalCode: string): void;
}

export interface SquarePaymentFormConstructor {
    new(options: SquareFormOptions): SquarePaymentForm;
}

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
    masterpass: SquareFormElement;
}

export interface Error {
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
    digital_wallet_type: string;
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
}

export enum CardBrand {
    americanExpress,
    discover,
    discoverDiners,
    JCB,
    masterCard,
    unionPay,
    unknown,
    visa,
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
    cardNonceResponseReceived?(errors: any, nonce: string): void;
}

export type SquareFormFactory = (options: SquareFormOptions) => SquarePaymentForm;
