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
    options?: Options;
}

export interface Options {
    helperLabel: string;
    items: Item[];
}

export interface Item {
    value: string;
    label: string;
}
