export interface B2BExtraField {
    fieldName: string;
    fieldValue: string | number;
}

export interface OrderB2BMetadata {
    invoiceComment?: string;
    orderExtraFields?: B2BExtraField[];
    poNumber?: string;
    referenceNumber?: string;
}
