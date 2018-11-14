export enum CheckoutIncludes {
    AvailableShippingOptions = 'consignments.availableShippingOptions',
    PhysicalItemsBrandName = 'cart.lineItems.physicalItems.brand',
    DigitalItemsBrandName = 'cart.lineItems.digitalItems.brand',
    PhysicalItemsCategoryNames = 'cart.lineItems.physicalItems.categoryNames',
    DigitalItemsCategoryNames = 'cart.lineItems.digitalItems.categoryNames',
}

export default interface CheckoutParams {
    include?: CheckoutIncludes[];
}
