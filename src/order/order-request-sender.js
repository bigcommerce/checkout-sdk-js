export default class OrderRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Order>>}
     */
    loadOrder(orderId, { timeout } = {}) {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.get(url, { timeout });
    }

    /**
     * @param {OrderRequestBody} body
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Order>>}
     */
    submitOrder(body, { timeout } = {}) {
        const url = '/internalapi/v1/checkout/order';

        return this._requestSender.post(url, { body, timeout });
    }

    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Order>>}
     */
    finalizeOrder(orderId, { timeout } = {}) {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.post(url, { timeout });
    }
}
