export enum OrderIncludes {
    PhysicalItemsBrandName = 'lineItems.physicalItems.brands',
    PhysicalItemsCategoryNames = 'lineItems.physicalItems.categoryNames',
    DigitalItemsBrandName = 'lineItems.digitalItems.brands',
    DigitalItemsCategoryNames = 'lineItems.digitalItems.categoryNames',
}

export default interface OrderParams {
    include?: OrderIncludes[];
}
