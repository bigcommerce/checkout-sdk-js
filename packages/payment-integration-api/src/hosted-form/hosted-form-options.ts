// copied from packages/core/src/hosted-form/hosted-form-options.ts

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
    fields: HostedFieldOptionsMap;
    styles?: HostedFieldStylesMap;
    onBlur?(data: HostedFieldBlurEventData): void;
    onCardTypeChange?(data: HostedFieldCardTypeChangeEventData): void;
    onEnter?(data: HostedFieldEnterEventData): void;
    onFocus?(data: HostedFieldFocusEventData): void;
    onValidate?(data: HostedFieldValidateEventData): void;
}

type HostedFieldBlurEventData = HostedInputBlurEvent['payload'];
type HostedFieldCardTypeChangeEventData = HostedInputCardTypeChangeEvent['payload'];
type HostedFieldEnterEventData = HostedInputEnterEvent['payload'];
type HostedFieldFocusEventData = HostedInputFocusEvent['payload'];
type HostedFieldValidateEventData = HostedInputValidateEvent['payload'];

type HostedFieldOptionsMap = HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap;

interface HostedCardFieldOptionsMap {
    [HostedFieldType.CardCode]?: HostedCardFieldOptions;
    [HostedFieldType.CardExpiry]: HostedCardFieldOptions;
    [HostedFieldType.CardName]: HostedCardFieldOptions;
    [HostedFieldType.CardNumber]: HostedCardFieldOptions;
}

interface HostedStoredCardFieldOptionsMap {
    [HostedFieldType.CardCodeVerification]?: HostedStoredCardFieldOptions;
    [HostedFieldType.CardNumberVerification]?: HostedStoredCardFieldOptions;
}

interface HostedCardFieldOptions {
    accessibilityLabel?: string;
    containerId: string;
    placeholder?: string;
}

interface HostedStoredCardFieldOptions extends HostedCardFieldOptions {
    instrumentId: string;
}

interface HostedFieldStylesMap {
    default?: HostedFieldStyles;
    error?: HostedFieldStyles;
    focus?: HostedFieldStyles;
}

type HostedFieldStyles = HostedInputStyles;
