export interface TdOnlineMartHostWindow extends Window {
    customcheckout?(): CustomCheckoutSDK;
}

export interface CustomCheckoutSDK {
    create(fieldType: FieldType): TdOnlineMartElement;
}

interface TdOnlineMartElement {
    mount(cssSelector: string): void;
}

type FieldType = 'card-number' | 'cvv' | 'expiry';
