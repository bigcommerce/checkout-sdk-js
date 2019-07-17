import { AddressKey } from '../address';

export default FormField;

type FormField = SystemFormField | CustomFormField;

export enum FormFieldFieldType {
    checkbox = 'checkbox',
    date = 'date',
    text = 'text',
    dropdown = 'dropdown',
    radio = 'radio',
    multiline = 'multiline',
}

export enum FormFieldType {
    array = 'array',
    date = 'date',
    number = 'integer',
    string = 'string',
}

export interface BaseFormField {
    name: string;
    custom: boolean;
    id: string;
    label: string;
    required: boolean;
    default?: string;
    fieldType?: FormFieldFieldType;
}

export interface SystemFormField extends BaseFormField {
    name: AddressKey;
    custom: false;
    maxLength?: number;
    options?: FormFieldOptions;
}

export type CustomFormField = DateCustomFormField |
    TextCustomFormField |
    NumberCustomFormField |
    MultilineCustomFormField |
    ArrayCustomFormField;

interface BaseCustomFormField extends BaseFormField {
    custom: true;
    type?: FormFieldType;
}

export interface DateCustomFormField extends BaseCustomFormField {
    min: number | string;
    max: number | string;
    fieldType: FormFieldFieldType.date;
    type: FormFieldType.date;
}

export interface ArrayCustomFormField extends BaseCustomFormField {
    fieldType: FormFieldFieldType.checkbox | FormFieldFieldType.radio | FormFieldFieldType.dropdown;
    type: FormFieldType.array;
    itemtype: 'string';
    options: FormFieldOptions;
}

export interface TextCustomFormField extends BaseCustomFormField {
    fieldType: FormFieldFieldType.text;
    type: FormFieldType.string;
    maxLength?: number;
    secret?: boolean;
}

export interface NumberCustomFormField extends BaseCustomFormField {
    fieldType: FormFieldFieldType.text;
    type: FormFieldType.number;
    min?: number;
    max?: number;
    maxLength?: number;
}

export interface MultilineCustomFormField extends TextCustomFormField {
    options: {
        rows: number;
    };
}

export interface FormFieldOptions {
    helperLabel?: string;
    items: FormFieldItem[];
}

export interface FormFieldItem {
    value: string;
    label: string;
}
