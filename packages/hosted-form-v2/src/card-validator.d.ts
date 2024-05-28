import 'card-validator';

// Merge @types/card-validator with missing methods. We probably don't need this
// once the official package is updated with the latest type definitions.
declare module 'card-validator' {
    type CardBrand =
        | 'american-express'
        | 'diners-club'
        | 'discover'
        | 'jcb'
        | 'maestro'
        | 'mastercard'
        | 'unionpay'
        | 'visa'
        | 'mada';

    interface CreditCardTypeInfo {
        patterns?: Array<number | [number, number]>;
        niceType?: string;
        type?: CardBrand;
        prefixPattern?: RegExp;
        exactPattern?: RegExp;
        gaps?: number[];
        lengths?: number[];
        code?: {
            name?: string;
            size?: number;
        };
    }

    interface CreditCardType {
        types: { [type: string]: string };
        (cardNumber: string): CreditCardTypeInfo[];
        getTypeInfo(type: string): CreditCardTypeInfo;
        updateCard(type: string, updates: Partial<CreditCardTypeInfo>): void;
        addCard(config: Partial<CreditCardTypeInfo>): void;
    }

    export const creditCardType: CreditCardType;
}
