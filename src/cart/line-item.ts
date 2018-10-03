export interface PhysicalItem extends LineItem {
    isShippingRequired: boolean;
    giftWrapping?: {
        name: string;
        message: string;
        amount: number;
    };
}

export interface DigitalItem extends LineItem {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}

export interface GiftCertificateItem {
    id: string | number;
    name: string;
    theme: string;
    amount: number;
    taxable: boolean;
    sender: {
        name: string;
        email: string;
    };
    recipient: {
        name: string;
        email: string;
    };
    message: string;
}

export interface LineItem {
    id: string | number;
    variantId: number;
    productId: number;
    sku: string;
    name: string;
    url: string;
    quantity: number;
    brand: string;
    isTaxable: boolean;
    imageUrl: string;
    discounts: Array<{ name: string, discountedAmount: number }>;
    discountAmount: number;
    couponAmount: number;
    listPrice: number;
    salePrice: number;
    extendedListPrice: number;
    extendedSalePrice: number;
    socialMedia?: LineItemSocialData[];
    options?: LineItemOption[];
    addedByPromotion: boolean;
}

export interface LineItemOption {
    name: string;
    nameId: number;
    value: string;
    valueId: number;
}

export interface LineItemSocialData {
    channel: string;
    code: string;
    text: string;
    link: string;
}
