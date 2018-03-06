export default class QuoteRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Quote>>}
     */
    loadQuote({ timeout } = {}) {
        const url = '/internalapi/v1/checkout/quote';
        const params = {
            includes: ['cart', 'customer', 'shippingOptions', 'order'].join(','),
        };

        return this._requestSender.get(url, { params, timeout });
    }
}
