export interface Extension {
    id: string;
    name: string;
    region: ExtensionRegions;
    url: string;
}

export enum ExtensionRegions {
    ShippingShippingAddressFormBefore = 'shipping.shippingAddressForm.before',
    ShippingShippingAddressFormAfter = 'shipping.shippingAddressForm.after',
}
