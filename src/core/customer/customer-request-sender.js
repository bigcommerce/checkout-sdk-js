export default class CustomerRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {CustomerCredentials} credentials
     * @param {RequestOptions} [options]
     * @return {Promise<CustomerResponseBody>}
     */
    signInCustomer(credentials, { timeout } = {}) {
        const url = '/internalapi/v1/checkout/customer';
        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.post(url, { params, timeout, body: credentials });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CustomerResponseBody>}
     */
    signOutCustomer({ timeout } = {}) {
        const url = '/internalapi/v1/checkout/customer';
        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.delete(url, { params, timeout });
    }
}
