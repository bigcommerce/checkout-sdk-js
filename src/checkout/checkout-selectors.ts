import CheckoutErrorSelector from './checkout-error-selector';
import CheckoutSelector from './checkout-selector';
import CheckoutStatusSelector from './checkout-status-selector';

export default interface CheckoutSelectors {
    checkout: CheckoutSelector;
    errors: CheckoutErrorSelector;
    statuses: CheckoutStatusSelector;
}
