export interface Extension {
    id: string;
    name: string;
    region: ExtensionRegions;
    origin: string;
    url: string;
}

export enum ExtensionRegions {
    ShippingShippingAddressFormBefore = 'shipping.shippingAddressForm.before',
    ShippingShippingAddressFormAfter = 'shipping.shippingAddressForm.after',
}
