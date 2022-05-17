export enum OrderIncludes {
    DigitalItemsCategories = 'lineItems.digitalItems.categories',
    PhysicalItemsCategories = 'lineItems.physicalItems.categories',
}

export default interface OrderParams {
    include?: OrderIncludes[];
}
