import { AddressKey } from '../address';

export type FormFieldFieldType =
    'checkbox' |
    'date' |
    'text' |
    'dropdown' |
    'radio' |
    'multiline';

export type FormFieldType =
    'array' |
    'date' |
    'integer' |
    'string';

export default interface FormField {
    name: string | AddressKey;
    custom: boolean;
    id: string;
    label: string;
    required: boolean;
    default?: string;
    fieldType?: FormFieldFieldType;
    type?: FormFieldType;
    itemtype?: string;
    maxLength?: number;
    secret?: boolean;
    min?: string | number;
    max?: string | number;
    options?: FormFieldOptions;
}

export interface FormFieldOptions {
    helperLabel?: string;
    items?: FormFieldItem[];
    rows?: number;
}

export interface FormFieldItem {
    value: string;
    label: string;
}
