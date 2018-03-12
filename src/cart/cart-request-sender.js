export default class CartRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<InternalCart>>}
     */
    loadCart({ timeout } = {}) {
        const url = '/internalapi/v1/checkout/cart';

        return this._requestSender.get(url, { timeout });
    }
}
