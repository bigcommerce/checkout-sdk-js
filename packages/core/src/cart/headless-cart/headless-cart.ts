interface BaseFieldFragment {
    value: number;
}

export interface HeadlessLineItem {
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

interface HeadlessPhysicalItem extends HeadlessLineItem {
    isShippingRequired: boolean;
    giftWrapping?: {
        amount: {
            value: number;
        };
        message: string;
        name: string;
    } | null;
}

interface HeadlessDigitalItem extends HeadlessLineItem {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}

export interface HeadlessCustomItem {
    entityId: string;
    listPrice: BaseFieldFragment;
    extendedListPrice: BaseFieldFragment;
    name: string;
    quantity: number;
    sku: string;
}

export interface HeadlessGiftCertificates {
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

export interface HeadlessLineItems {
    physicalItems: HeadlessPhysicalItem[];
    digitalItems: HeadlessDigitalItem[];
    customItems: HeadlessCustomItem[];
    giftCertificates?: HeadlessGiftCertificates[];
}

export default interface HeadlessCartResponse {
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
        lineItems: HeadlessLineItems;
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
