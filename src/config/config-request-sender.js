export default class ConfigRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Config>>}
     */
    loadConfig({ timeout } = {}) {
        const url = '/internalapi/v1/checkout/configuration';

        return this._requestSender.get(url, { timeout });
    }
}
