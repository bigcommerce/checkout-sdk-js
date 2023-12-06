export interface TdOnlineMartHostWindow extends Window {
    customcheckout?(): TDCustomCheckoutSDK;
}

export interface TDCustomCheckoutSDK {
    create(fieldType: FieldType): TdOnlineMartElement;
    createToken(callback: (result: CreateTokenResponse) => void): void;
}

export interface TdOnlineMartElement {
    mount(cssSelector: string): void;
    unmount(): void;
}

export enum FieldType {
    CARD_NUMBER = 'card-number',
    CVV = 'cvv',
    EXPIRY = 'expiry',
}

interface CreateTokenResponse {
    code: string;
    error?: CreateTokenError;
    token?: string;
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
}

interface CreateTokenError {
    field: string;
    type: string;
    message: string;
}
