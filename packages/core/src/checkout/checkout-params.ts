export enum CheckoutIncludes {
    AvailableShippingOptions = 'consignments.availableShippingOptions',
    PhysicalItemsCategoryNames = 'cart.lineItems.physicalItems.categoryNames',
    DigitalItemsCategoryNames = 'cart.lineItems.digitalItems.categoryNames',
}

export default interface CheckoutParams {
    include?: CheckoutIncludes[] | CheckoutIncludeParam;
}

export type CheckoutIncludeParam = {
    [key in CheckoutIncludes]?: boolean;
};
