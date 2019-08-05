import {
    createCheckoutStoreSelectorFactory,
    CheckoutSelectors,
    CheckoutStoreErrorSelector,
    CheckoutStoreStatusSelector,
    InternalCheckoutSelectors,
} from '../checkout';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
    const createCheckoutStoreSelector = createCheckoutStoreSelectorFactory();

    const data = createCheckoutStoreSelector(selectors);
    const errors = new CheckoutStoreErrorSelector(selectors);
    const statuses = new CheckoutStoreStatusSelector(selectors);

    return {
        data,
        errors,
        statuses,
    };
}
