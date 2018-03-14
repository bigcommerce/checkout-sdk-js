import CheckoutStoreSelector from './checkout-store-selector';
import CheckoutStoreStatusSelector from './checkout-store-status-selector';
import CheckoutStoreErrorSelector from './checkout-store-error-selector';

export default interface CheckoutSelectors {
    checkout: CheckoutStoreSelector;
    errors: CheckoutStoreErrorSelector;
    statuses: CheckoutStoreStatusSelector;
}
