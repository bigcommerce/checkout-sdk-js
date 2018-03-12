export default class GiftCertificateRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {string} couponCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<InternalCart>>}
     */
    applyGiftCertificate(couponCode, { timeout } = {}) {
        const url = '/internalapi/v1/checkout/coupon';

        return this._requestSender.post(url, { timeout, body: { couponCode } });
    }

    /**
     * @param {string} couponCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<InternalCart>>}
     */
    removeGiftCertificate(couponCode, { timeout } = {}) {
        const url = `/internalapi/v1/checkout/coupon/${couponCode}`;

        return this._requestSender.delete(url, { timeout });
    }
}
