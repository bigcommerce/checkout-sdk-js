export interface PhysicalItem extends LineItem {
    isShippingRequired: boolean;
    giftWrapping?: {
        name: string;
        message: string;
        amount: number;
    };
}

export interface DigitalItem extends LineItem {
    downloadFileUrls: [
        string
    ];
    downloadPageUrl: string;
    downloadSize: string;
}

export interface GiftCertificateItem {
    id: string;
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
    id: number;
    variantId: number;
    productId: number;
    sku: string;
    name: string;
    url: string;
    quantity: number;
    isTaxable: boolean;
    imageUrl: string;
    discounts: Array<{ name: string, discountedAmount: number }>;
    discountAmount: number;
    couponAmount: number;
    listPrice: number;
    salePrice: number;
    extendedListPrice: number;
    extendedSalePrice: number;
}
