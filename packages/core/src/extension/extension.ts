export interface Extension {
    id: string;
    name: string;
    region: ExtensionRegion;
    url: string;
}

export interface ExtensionIframeConfig {
    cartId: string;
    parentOrigin: string;
}

export const enum ExtensionRegion {
    ShippingShippingAddressFormBefore = 'shipping.shippingAddressForm.before',
    ShippingShippingAddressFormAfter = 'shipping.shippingAddressForm.after',
}
