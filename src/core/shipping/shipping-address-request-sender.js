export default class ShippingAddressRequestSender {
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
     * @return {Promise<Response<Address>>}
     */
    updateAddress(address, { timeout } = {}) {
        const url = '/internalapi/v1/checkout/shipping';

        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.post(url, { body: address, params, timeout });
    }
}
