export interface B2BExtraField {
    fieldName: string;
    fieldValue: string | number | boolean | string[];
}

export interface B2BOrderExtraInfo {
    addressExtraFields?: {
        billingAddressExtraFields: B2BExtraField[];
        shippingAddressExtraFields: B2BExtraField[];
    };
    billingAddressId?: number;
    shipppingAddressId?: number; // triple-p is intentional — wire contract
}

export interface B2BOrderMetadataOptions {
    poNumber?: string;
    referenceNumber?: string;
    extraFields?: B2BExtraField[];
    extraInfo?: B2BOrderExtraInfo;
}
