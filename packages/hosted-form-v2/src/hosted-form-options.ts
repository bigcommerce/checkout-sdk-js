import HostedFieldType from './hosted-field-type';
import {
    HostedInputBlurEvent,
    HostedInputCardTypeChangeEvent,
    HostedInputEnterEvent,
    HostedInputFocusEvent,
    HostedInputStyles,
    HostedInputValidateEvent,
} from './iframe-content';

export default interface HostedFormOptions {
    fields: HostedCardFieldOptionsMap;
    styles?: HostedFieldStylesMap;
    onBlur?(data: HostedFieldBlurEventData): void;
    onCardTypeChange?(data: HostedFieldCardTypeChangeEventData): void;
    onEnter?(data: HostedFieldEnterEventData): void;
    onFocus?(data: HostedFieldFocusEventData): void;
    onValidate?(data: HostedFieldValidateEventData): void;
}

export type HostedFormErrorDataKeys =
    | 'number'
    | 'expirationDate'
    | 'expirationMonth'
    | 'expirationYear'
    | 'cvv'
    | 'postalCode';

export interface HostedFormErrorData {
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

export type HostedFormErrorsData = Partial<Record<HostedFormErrorDataKeys, HostedFormErrorData>>;

export type HostedFieldBlurEventData = HostedInputBlurEvent['payload'];
export type HostedFieldCardTypeChangeEventData = HostedInputCardTypeChangeEvent['payload'];
export type HostedFieldEnterEventData = HostedInputEnterEvent['payload'];
export type HostedFieldFocusEventData = HostedInputFocusEvent['payload'];
export type HostedFieldValidateEventData = HostedInputValidateEvent['payload'];

export interface HostedCardFieldOptionsMap {
    [HostedFieldType.CardCode]?: HostedCardFieldOptions;
    [HostedFieldType.CardExpiry]: HostedCardFieldOptions;
    [HostedFieldType.CardName]: HostedCardFieldOptions;
    [HostedFieldType.CardNumber]: HostedCardFieldOptions;
}

export interface HostedCardFieldOptions {
    accessibilityLabel?: string;
    containerId: string;
    placeholder?: string;
}

export interface HostedFieldStylesMap {
    default?: HostedFieldStyles;
    error?: HostedFieldStyles;
    focus?: HostedFieldStyles;
}

export type HostedFieldStyles = HostedInputStyles;
