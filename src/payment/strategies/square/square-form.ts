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
    cardBrand: CardBrand;
    last4: number;
    expMonth: number;
    expYear: number;
    billingPostalCode: string;
    digitalWalletType: DigitalWalletType;
}

export enum CardBrand {
    americanExpress,
    discover,
    discoverDiners,
    JCB,
    masterCard,
    unionPay,
    unknown,
    visa
}

export enum DigitalWalletType {
    applePay,
    masterpass,
    none,
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
