import CheckoutButtonErrorSelector from './checkout-button-error-selector';
import CheckoutButtonStatusSelector from './checkout-button-status-selector';

export default interface CheckoutButtonSelectors {
    errors: CheckoutButtonErrorSelector;
    statuses: CheckoutButtonStatusSelector;
}
