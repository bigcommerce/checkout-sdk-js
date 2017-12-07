export default class PaymentMethodRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<PaymentMethod[]>>}
     */
    loadPaymentMethods({ timeout } = {}) {
        const url = '/internalapi/v1/checkout/payments';

        return this._requestSender.get(url, { timeout });
    }

    /**
     * @param {string} methodId
     * @param {RequestOptions} [options]
     * @return {Promise<Response<PaymentMethod>>}
     */
    loadPaymentMethod(methodId, { timeout } = {}) {
        const url = `/internalapi/v1/checkout/payments/${methodId}`;

        return this._requestSender.get(url, { timeout });
    }
}
