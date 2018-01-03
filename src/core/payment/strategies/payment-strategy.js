/**
 * @abstract
 */
export default class PaymentStrategy {
    /**
     * @constructor
     * @param {ReadableDataStore} store
     * @param {PlaceOrderService} placeOrderService
     */
    constructor(store, placeOrderService) {
        this._store = store;
        this._placeOrderService = placeOrderService;
    }

    /**
     * @abstract
     * @param {OrderRequestBody} payload
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    execute() {
        throw new Error('Not implemented');
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    finalize() {
        return Promise.reject(new Error('Not required'));
    }

    /**
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initialize() {
        return Promise.resolve(this._store.getState());
    }

    /**
     * @return {Promise<CheckoutSelectors>}
     */
    deinitialize() {
        return Promise.resolve(this._store.getState());
    }
}
