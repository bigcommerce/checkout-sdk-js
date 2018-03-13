export default class CheckoutRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {string} id
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Checkout>>}
     */
    loadCheckout(id, { timeout } = {}) {
        const url = `/api/storefront/checkout/${id}`;

        return this._requestSender.get(url, { timeout });
    }
}
