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

export enum ExtensionRegion {
    ShippingShippingAddressFormBefore = 'shipping.shippingAddressForm.before',
    ShippingShippingAddressFormAfter = 'shipping.shippingAddressForm.after',
    ShippingSelectedShippingMethod = 'shipping.selectedShippingMethod',
    PaymentPaymentMethodListBefore = 'payment.paymentMethodList.before',
    SummaryAfter = 'summary.after',
    SummaryLastItemAfter = 'summary.lastItem.after',
    GlobalWebWorker = 'global',
}

export enum ExtensionType {
    Iframe = 'iframe',
    Worker = 'worker',
}
