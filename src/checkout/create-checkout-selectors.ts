import {
    CheckoutSelectors,
    CheckoutStoreErrorSelector,
    CheckoutStoreSelector,
    CheckoutStoreStatusSelector,
    InternalCheckoutSelectors,
} from '../checkout';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
    const data = new CheckoutStoreSelector(selectors);
    const errors = new CheckoutStoreErrorSelector(selectors);
    const statuses = new CheckoutStoreStatusSelector(selectors);

    return {
        checkout: data, // Deprecated
        data,
        errors,
        statuses,
    };
}
