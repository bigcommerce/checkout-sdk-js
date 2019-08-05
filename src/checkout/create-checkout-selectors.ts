import {
    createCheckoutStoreErrorSelectorFactory,
    createCheckoutStoreSelectorFactory,
    createCheckoutStoreStatusSelectorFactory,
    CheckoutSelectors,
    InternalCheckoutSelectors,
} from '../checkout';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
    const createCheckoutStoreSelector = createCheckoutStoreSelectorFactory();
    const createCheckoutStoreErrorSelector = createCheckoutStoreErrorSelectorFactory();
    const createCheckoutStoreStatusSelector = createCheckoutStoreStatusSelectorFactory();

    const data = createCheckoutStoreSelector(selectors);
    const errors = createCheckoutStoreErrorSelector(selectors);
    const statuses = createCheckoutStoreStatusSelector(selectors);

    return {
        data,
        errors,
        statuses,
    };
}
