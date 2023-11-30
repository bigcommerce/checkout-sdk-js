export interface TdOnlineMartHostWindow extends Window {
    customcheckout?(): TDCustomCheckoutSDK;
}

export interface TDCustomCheckoutSDK {
    create(fieldType: FieldType): TdOnlineMartElement;
}

interface TdOnlineMartElement {
    mount(cssSelector: string): void;
}

export enum FieldType {
    CARD_NUMBER = 'card-number',
    CVV = 'cvv',
    EXPIRY = 'expiry',
}
