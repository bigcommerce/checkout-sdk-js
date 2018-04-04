export default class GiftCertificateRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {string} checkoutId
     * @param {string} giftCertificateCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<InternalCart>>}
     */
    applyGiftCertificate(checkoutId, giftCertificateCode, { timeout } = {}) {
        const url = `/api/storefront/checkouts/${checkoutId}/gift-certificates`;

        return this._requestSender.post(url, { timeout, body: { giftCertificateCode } });
    }

    /**
     * @param {string} checkoutId
     * @param {string} giftCertificateCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<InternalCart>>}
     */
    removeGiftCertificate(checkoutId, giftCertificateCode, { timeout } = {}) {
        const url = `/api/storefront/checkouts/${checkoutId}/gift-certificates/${giftCertificateCode}`;

        return this._requestSender.delete(url, { timeout });
    }
}
