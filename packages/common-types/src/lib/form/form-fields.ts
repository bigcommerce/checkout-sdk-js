import { AddressKey } from '../address';

export type FormFieldFieldType =
    'checkbox' |
    'date' |
    'text' |
    'dropdown' |
    'password' |
    'radio' |
    'multiline';

export type FormFieldType =
    'array' |
    'date' |
    'integer' |
    'string';

export interface CustomerPasswordRequirements {
    alpha: string;
    numeric: string;
    minlength: number;
    description: string;
}

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
    requirements?: CustomerPasswordRequirements;
}

export interface FormFields {
    customerAccount: FormField[];
    shippingAddress: FormField[];
    billingAddress: FormField[];
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
