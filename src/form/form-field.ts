export default interface FormField {
    id: string;
    name: string;
    custom: boolean;
    label: string;
    required: boolean;
    default?: string;
    type?: string;
    fieldType?: string;
    itemtype?: string;
    options?: FormFieldOptions;
}

export interface FormFieldOptions {
    helperLabel?: string;
    items: FormFieldItem[];
}

export interface FormFieldItem {
    value: string;
    label: string;
}
