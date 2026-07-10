export enum CheckoutIncludes {
    AvailableShippingOptions = 'consignments.availableShippingOptions',
    PhysicalItemsCategoryNames = 'cart.lineItems.physicalItems.categoryNames',
    DigitalItemsCategoryNames = 'cart.lineItems.digitalItems.categoryNames',
    BillingAddressExtraFields = 'billingAddress.extraFields',
    ConsignmentAddressExtraFields = 'consignments.address.extraFields',
    ConsignmentShippingAddressExtraFields = 'consignments.shippingAddress.extraFields',
    CustomerAddressesB2B = 'customer.addresses.b2b',
}

export default interface CheckoutParams {
    include?: CheckoutIncludes[] | CheckoutIncludeParam;
}

export type CheckoutIncludeParam = {
    [key in CheckoutIncludes]?: boolean;
};
