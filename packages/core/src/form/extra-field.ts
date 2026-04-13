export interface ExtraField {
    id: number;
    fieldName: string;
    fieldType: number;
    isRequired: boolean;
    visibleToEnduser: boolean;
    defaultValue: string;
    labelName: string;
    listOfValue?: string[];
    maximumLength?: number;
    numberOfRows?: number;
    maximumValue?: number;
}

export interface ExtraFieldValue {
    fieldId: string;
    fieldValue: string | number;
}
