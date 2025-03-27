interface BaseFieldFragment {
    value: number;
}

export interface GQLCartLineItem {
    name: string;
    entityId: string;
    quantity: number;
    productEntityId: number;
    brand: string;
    couponAmount: {
        value: number;
    };
    discountedAmount: {
        value: number;
    };
    discounts: Array<{
        discountedAmount: {
            value: number;
        };
        entityId: string;
    }>;
    extendedListPrice: {
        value: number;
    };
    extendedSalePrice: {
        value: number;
    };
    imageUrl: string;
    isTaxable: boolean;
    listPrice: {
        value: number;
    };
    originalPrice: {
        value: number;
    };
    salePrice: {
        value: number;
    };
    sku: string;
    url: string;
    variantEntityId: number;
    selectedOptions: Array<{
        value: string;
        valueEntityId: number;
        entityId: number;
        name: string;
    }>;
}

interface GQLCartPhysicalItem extends GQLCartLineItem {
    isShippingRequired: boolean;
    giftWrapping?: {
        amount: {
            value: number;
        };
        message: string;
        name: string;
    } | null;
}

interface GQLCartDigitalItem extends GQLCartLineItem {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}

export interface GQLCartCustomItem {
    entityId: string;
    listPrice: BaseFieldFragment;
    extendedListPrice: BaseFieldFragment;
    name: string;
    quantity: number;
    sku: string;
}

export interface GQLCartGiftCertificates {
    amount: BaseFieldFragment;
    name: string;
    theme: string;
    entityId: string | number;
    isTaxable: boolean;
    message: string;
    sender: {
        email: string;
        name: string;
    };
    recipient: {
        email: string;
        name: string;
    };
}

export interface GQLCartLineItems {
    physicalItems: GQLCartPhysicalItem[];
    digitalItems: GQLCartDigitalItem[];
    customItems: GQLCartCustomItem[];
    giftCertificates?: GQLCartGiftCertificates[];
}

export default interface GQLCartResponse {
    cart?: {
        amount: BaseFieldFragment;
        baseAmount: BaseFieldFragment;
        entityId: string;
        id: string;
        createdAt: {
            utc: string;
        };
        updatedAt: {
            utc: string;
        };
        discounts: Array<{
            discountedAmount: BaseFieldFragment;
            entityId: string;
        }>;
        discountedAmount: BaseFieldFragment;
        isTaxIncluded: boolean;
        currencyCode: string;
        lineItems: GQLCartLineItems;
    };
    checkout?: {
        coupons: Array<{
            entityId: string;
            code: string;
            couponType: string;
            discountedAmount: {
                value: number;
            };
        }>;
    };
    currency?: {
        display: {
            decimalPlaces: number;
            symbol: string;
        };
        name: string;
        code: string;
    };
}
