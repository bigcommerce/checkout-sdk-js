export interface Extension {
    id: string;
    name: string;
    region: ExtensionRegion;
    url: string;
}

export type ExtensionRegion =
    | 'shipping.shippingAddressForm.before'
    | 'shipping.shippingAddressForm.after';
