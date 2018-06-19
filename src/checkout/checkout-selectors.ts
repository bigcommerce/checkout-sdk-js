import CheckoutStoreErrorSelector from './checkout-store-error-selector';
import CheckoutStoreSelector from './checkout-store-selector';
import CheckoutStoreStatusSelector from './checkout-store-status-selector';

export default interface CheckoutSelectors {
    /**
     * @deprecated This property has been renamed to `data`.
     */
    checkout: CheckoutStoreSelector;
    data: CheckoutStoreSelector;
    errors: CheckoutStoreErrorSelector;
    statuses: CheckoutStoreStatusSelector;
}
