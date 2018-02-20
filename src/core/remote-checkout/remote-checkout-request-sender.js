export default class RemoteCheckoutRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {string} methodName
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @return {Promise<Response<Address>>}
     */
    initializeBilling(methodName, params, { timeout } = {}) {
        const url = `/remote-checkout/${methodName}/billing`;

        return this._requestSender.get(url, { params, timeout });
    }

    /**
     * @param {string} methodName
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @return {Promise<Response<Address>>}
     */
    initializeShipping(methodName, params, { timeout } = {}) {
        const url = `/remote-checkout/${methodName}/shipping`;

        return this._requestSender.get(url, { params, timeout });
    }

    /**
     * @param {string} methodName
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {boolean} [params.useStoreCredit]
     * @param {boolean} [params.authorizationToken]
     * @param {RequestOptions} [options]
     * @return {Promise<Response<boolean>>}
     */
    initializePayment(methodName, params, { timeout } = {}) {
        const url = `/remote-checkout/${methodName}/payment`;

        return this._requestSender.get(url, { params, timeout });
    }

    /**
     * @param {string} methodName
     * @param {RequestOptions} [options]
     * @return {Promise<Response<void>>}
     */
    signOut(methodName, { timeout } = {}) {
        const url = `/remote-checkout/${methodName}/signout`;

        return this._requestSender.get(url, { timeout });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<{ token: string }>>}
     */
    generateToken({ timeout } = {}) {
        const url = '/remote-checkout-token';

        return this._requestSender.get(url, { timeout });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<void>>}
     */
    trackAuthorizationEvent({ timeout } = {}) {
        const url = '/remote-checkout/events/shopper-checkout-service-provider-authorization-requested';

        return this._requestSender.post(url, { timeout });
    }
}
