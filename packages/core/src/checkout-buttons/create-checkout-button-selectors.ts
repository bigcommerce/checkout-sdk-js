import { InternalCheckoutSelectors } from '../checkout';
import HeadlessButtonSelectors from '../headless-buttons/headless-button-selectors';

import CheckoutButtonErrorSelector from './checkout-button-error-selector';
import CheckoutButtonSelectors from './checkout-button-selectors';
import CheckoutButtonStatusSelector from './checkout-button-status-selector';

export default function createCheckoutButtonSelectors(
    selectors: InternalCheckoutSelectors | HeadlessButtonSelectors,
): CheckoutButtonSelectors {
    const errors = new CheckoutButtonErrorSelector(selectors);
    const statuses = new CheckoutButtonStatusSelector(selectors);

    return {
        errors,
        statuses,
    };
}
