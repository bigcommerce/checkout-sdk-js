import { NotImplementedError } from '../../common/error/errors';
import { OrderFinalizationNotRequiredError } from '../../order/errors';

/**
 * @abstract
 */
export default class PaymentStrategy {
    /**
     * @constructor
     * @param {PaymentMethod} paymentMethod
     * @param {ReadableDataStore} store
     * @param {PlaceOrderService} placeOrderService
     */
    constructor(paymentMethod, store, placeOrderService) {
        this._paymentMethod = paymentMethod;
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
        throw new NotImplementedError();
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    finalize() {
        return Promise.reject(new OrderFinalizationNotRequiredError());
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
