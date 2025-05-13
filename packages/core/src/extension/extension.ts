export interface Extension {
    id: string;
    name: string;
    region: ExtensionRegion;
    url: string;
    type?: string;
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
    GlobalWebWorker = 'global.webworker',
}
