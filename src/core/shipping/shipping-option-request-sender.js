export default class ShippingOptionRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<ShippingOptions[]>>}
     */
    loadShippingOptions({ timeout } = {}) {
        const url = '/internalapi/v1/checkout/shippingoptions';

        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.get(url, { params, timeout });
    }

    /**
     * @param {string} addressId
     * @param {string} shippingOptionId
     * @param {RequestOptions} [options]
     * @return {Promise<Response<ShippingOptions[]>>}
     */
    selectShippingOption(addressId, shippingOptionId, { timeout } = {}) {
        const body = { addressId, shippingOptionId };
        const url = '/internalapi/v1/checkout/shippingoptions';

        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.put(url, { body, params, timeout });
    }
}
