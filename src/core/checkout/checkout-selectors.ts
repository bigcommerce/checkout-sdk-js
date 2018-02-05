import CheckoutSelector from './checkout-selector';
import CheckoutStatusSelector from './checkout-status-selector';
import CheckoutErrorSelector from './checkout-error-selector';

export default interface CheckoutSelectors {
    checkout: CheckoutSelector;
    errors: CheckoutErrorSelector;
    statuses: CheckoutStatusSelector;
}
