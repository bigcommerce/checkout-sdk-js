import {
    createCheckoutStoreSelectorFactory,
    createCheckoutStoreStatusSelectorFactory,
    CheckoutSelectors,
    CheckoutStoreErrorSelector,
    InternalCheckoutSelectors,
} from '../checkout';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
    const createCheckoutStoreSelector = createCheckoutStoreSelectorFactory();
    const createCheckoutStoreStatusSelector = createCheckoutStoreStatusSelectorFactory();

    const data = createCheckoutStoreSelector(selectors);
    const errors = new CheckoutStoreErrorSelector(selectors);
    const statuses = createCheckoutStoreStatusSelector(selectors);

    return {
        data,
        errors,
        statuses,
    };
}
