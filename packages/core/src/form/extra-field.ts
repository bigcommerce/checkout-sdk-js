export interface ExtraFieldApiResponse {
    id: number;
    fieldName: string;
    fieldType: number;
    isRequired: boolean;
    visibleToEnduser: boolean;
    configType: number;
    defaultValue: string;
    labelName: string;
    maximumLength?: string;
    numberOfRows?: string;
    maximumValue?: string;
}

export interface ExtraField {
    id: number;
    fieldName: string;
    fieldType: number;
    isRequired: boolean;
    visibleToEnduser: boolean;
    defaultValue: string;
    labelName: string;
    // configType?: number;
    listOfValue?: string[];
    maximumLength?: number;
    numberOfRows?: number;
    maximumValue?: number;
}

export interface ExtraFieldValue {
    fieldId: number;
    fieldValue: string | number;
}
