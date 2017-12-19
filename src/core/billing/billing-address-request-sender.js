export default class BillingAddressRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Promise<Address>}
     */
    updateAddress(address, { timeout } = {}) {
        const url = '/internalapi/v1/checkout/billing';

        const params = {
            includes: ['cart', 'quote'].join(','),
        };

        return this._requestSender.post(url, { body: address, params, timeout });
    }
}
