export default class CouponRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {string} checkoutId
     * @param {string} couponCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<InternalCart>>}
     */
    applyCoupon(checkoutId, couponCode, { timeout } = {}) {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons`;

        return this._requestSender.post(url, { timeout, body: { couponCode } });
    }

    /**
     * @param {string} couponCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<InternalCart>>}
     */
    removeCoupon(checkoutId, couponCode, { timeout } = {}) {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons/${couponCode}`;

        return this._requestSender.delete(url, { timeout });
    }
}
