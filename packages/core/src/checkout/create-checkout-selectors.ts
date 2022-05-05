import { createCheckoutStoreErrorSelectorFactory, createCheckoutStoreSelectorFactory, createCheckoutStoreStatusSelectorFactory, CheckoutSelectors, InternalCheckoutSelectors } from '../checkout';

export type CheckoutSelectorsFactory = (selectors: InternalCheckoutSelectors) => CheckoutSelectors;

export function createCheckoutSelectorsFactory(): CheckoutSelectorsFactory {
    const createCheckoutStoreSelector = createCheckoutStoreSelectorFactory();
    const createCheckoutStoreErrorSelector = createCheckoutStoreErrorSelectorFactory();
    const createCheckoutStoreStatusSelector = createCheckoutStoreStatusSelectorFactory();

    return (selectors: InternalCheckoutSelectors) => {
        const data = createCheckoutStoreSelector(selectors);
        const errors = createCheckoutStoreErrorSelector(selectors);
        const statuses = createCheckoutStoreStatusSelector(selectors);

        return {
            data,
            errors,
            statuses,
        };
    };
}

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
    return createCheckoutSelectorsFactory()(selectors);
}
