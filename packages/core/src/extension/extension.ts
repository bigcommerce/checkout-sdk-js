export interface Extension {
    id: string;
    name: string;
    region: ExtensionRegion;
    url: string;
    type: ExtensionType;
}

export interface ExtensionIframeConfig {
    cartId: string;
    parentOrigin: string;
}

export const enum ExtensionRegion {
    ShippingShippingAddressFormBefore = 'shipping.shippingAddressForm.before',
    ShippingShippingAddressFormAfter = 'shipping.shippingAddressForm.after',
    ShippingSelectedShippingMethod = 'shipping.selectedShippingMethod',
    SummaryAfter = 'summary.after',
    SummaryLastItemAfter = 'summary.lastItem.after',
    GlobalWebWorker = 'global',
}

export const enum ExtensionType {
    Iframe = 'iframe',
    Worker = 'worker',
}
