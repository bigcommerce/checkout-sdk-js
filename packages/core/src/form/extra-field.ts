export type ExtraFieldType = 'text' | 'multiline_text' | 'number' | 'dropdown';

export interface ExtraFieldConfig {
    defaultValue?: string | number;
    maxLength?: number;
    numberOfRows?: number;
    maxValue?: number;
    options?: string[];
}

export interface ExtraField {
    id: string;
    name: string;
    isRequired: boolean;
    type: ExtraFieldType;
    config: ExtraFieldConfig;
}

export interface AddressExtraFieldValue {
    fieldId: string;
    fieldValue: string | number;
}

export interface ExtraFields {
    address: ExtraField[];
    order: ExtraField[];
}
