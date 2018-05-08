import { CheckoutErrorSelector, CheckoutSelector, CheckoutSelectors, CheckoutStatusSelector, InternalCheckoutSelectors } from '../checkout';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
    const checkout = new CheckoutSelector(selectors);
    const errors = new CheckoutErrorSelector(selectors);
    const statuses = new CheckoutStatusSelector(selectors);

    return {
        checkout,
        errors,
        statuses,
    };
}
