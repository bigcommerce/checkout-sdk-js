export default class ShippingCountryRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     * @param {Object} config
     * @param {string} config.locale
     */
    constructor(requestSender, config) {
        this._requestSender = requestSender;
        this._config = config;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Country[]>>}
     */
    loadCountries({ timeout } = {}) {
        const url = '/internalapi/v1/shipping/countries';
        const headers = {
            'Accept-Language': this._config.locale,
        };

        return this._requestSender.get(url, { headers, timeout });
    }
}
