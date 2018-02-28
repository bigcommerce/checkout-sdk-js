import { isAddressEqual } from '../address';
import { RemoteCheckoutSynchronizationError } from './errors';

export default class RemoteCheckoutService {
    /**
     * @constructor
     * @param {DataStore} store
     * @param {BillingAddressActionCreator} billingAddressActionCreator
     * @param {ShippingAddressActionCreator} shippingAddressActionCreator
     * @param {RemoteCheckoutActionCreator} remoteCheckoutActionCreator
     */
    constructor(
        store,
        billingAddressActionCreator,
        shippingAddressActionCreator,
        remoteCheckoutActionCreator
    ) {
        this._store = store;
        this._billingAddressActionCreator = billingAddressActionCreator;
        this._shippingAddressActionCreator = shippingAddressActionCreator;
        this._remoteCheckoutActionCreator = remoteCheckoutActionCreator;
    }

    /**
     * @param {string} methodId
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializeBilling(methodId, params, options) {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializeBilling(methodId, params, options)
        );
    }

    /**
     * @param {string} methodId
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializeShipping(methodId, params, options) {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializeShipping(methodId, params, options)
        );
    }

    /**
     * @param {string} methodId
     * @param {Object} params
     * @param {?string} [params.referenceId]
     * @param {?string} [params.customerMessage]
     * @param {?boolean} [params.useStoreCredit]
     * @param {?boolean} [params.authorizationToken]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializePayment(methodId, params, options) {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializePayment(methodId, params, options)
        );
    }

    /**
     * @param {string} methodId
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    synchronizeBillingAddress(methodId, params, options) {
        return this.initializeBilling(methodId, params, options)
            .then(({ checkout }) => {
                const { remoteCheckout: { billingAddress } = {} } = checkout.getCheckoutMeta();

                if (billingAddress === false) {
                    throw new RemoteCheckoutSynchronizationError();
                }

                if (isAddressEqual(billingAddress, checkout.getBillingAddress()) || !billingAddress) {
                    return this._store.getState();
                }

                return this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(billingAddress, options)
                );
            });
    }

    /**
     * @param {string} methodId
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    synchronizeShippingAddress(methodId, params, options) {
        return this.initializeShipping(methodId, params, options)
            .then(({ checkout }) => {
                const { remoteCheckout: { shippingAddress } = {} } = checkout.getCheckoutMeta();

                if (shippingAddress === false) {
                    throw new RemoteCheckoutSynchronizationError(methodId);
                }

                if (isAddressEqual(shippingAddress, checkout.getShippingAddress())) {
                    return this._store.getState();
                }

                return this._store.dispatch(
                    this._shippingAddressActionCreator.updateAddress(shippingAddress, options)
                );
            });
    }

    /**
     * @param {string} methodId
     * @param {any} meta
     * @return {Promise<CheckoutSelectors>}
     */
    setCheckoutMeta(methodId, meta) {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.setCheckoutMeta(methodId, meta)
        );
    }
}
