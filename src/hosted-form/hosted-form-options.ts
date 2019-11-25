import HostedFieldType from './hosted-field-type';
import { HostedInputBlurEvent, HostedInputCardTypeChangeEvent, HostedInputFocusEvent, HostedInputStyles, HostedInputValidateErrorEvent } from './iframe-content';

export default interface HostedFormOptions {
    fields: HostedFieldOptionsMap;
    styles?: HostedFieldStylesMap;
    onBlur?(data: HostedFieldBlurEventData): void;
    onCardTypeChange?(data: HostedFieldCardTypeChangeEventData): void;
    onFocus?(data: HostedFieldFocusEventData): void;
    onValidateError?(data: HostedFieldValidateErrorEventData): void;
}

export type HostedFieldBlurEventData = HostedInputBlurEvent['payload'];
export type HostedFieldCardTypeChangeEventData = HostedInputCardTypeChangeEvent['payload'];
export type HostedFieldFocusEventData = HostedInputFocusEvent['payload'];
export type HostedFieldValidateErrorEventData = HostedInputValidateErrorEvent['payload'];

export interface HostedFieldOptionsMap {
    [HostedFieldType.CardCode]?: HostedFieldOptions;
    [HostedFieldType.CardExpiry]: HostedFieldOptions;
    [HostedFieldType.CardName]: HostedFieldOptions;
    [HostedFieldType.CardNumber]: HostedFieldOptions;
}

export interface HostedFieldOptions {
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
