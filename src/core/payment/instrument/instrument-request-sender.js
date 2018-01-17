export default class InstrumentRequestSender {
    /**
     * @constructor
     * @param {BigpayClient} client
     * @param {RequestSender} requestSender
     */
    constructor(client, requestSender) {
        this._client = client;
        this._requestSender = requestSender;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<VaultAccessTokenResponseBody>>}
     */
    getVaultAccessToken({ timeout } = {}) {
        const url = '/internalapi/v1/checkout/payments/vault-access-token';

        return this._requestSender.get(url, { timeout });
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {string} authToken
     * @return {Promise<Response<InstrumentsResponseBody>>}
     */
    getInstruments(storeId, shopperId, authToken) {
        const payload = { storeId, shopperId, authToken };

        return new Promise((resolve, reject) => {
            this._client.getShopperInstruments(payload, (error, response) => {
                if (error) {
                    reject(this._transformResponse(error));
                } else {
                    resolve(this._transformResponse(response));
                }
            });
        });
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {InstrumentRequestBody} instrument
     * @param {string} authToken
     * @return {Promise<Response<InstrumentResponseBody>>}
     */
    vaultInstrument(storeId, shopperId, instrument, authToken) {
        const payload = {
            storeId,
            shopperId,
            authToken,
            instrument,
        };

        return new Promise((resolve, reject) => {
            this._client.postShopperInstrument(payload, (error, response) => {
                if (error) {
                    reject(this._transformResponse(error));
                } else {
                    resolve(this._transformResponse(response));
                }
            });
        });
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {string} authToken
     * @param {string} instrumentId
     * @return {Promise<void>}
     */
    deleteInstrument(storeId, shopperId, authToken, instrumentId) {
        const payload = { storeId, shopperId, authToken, instrumentId };

        return new Promise((resolve, reject) => {
            this._client.deleteShopperInstrument(payload, (error, response) => {
                if (error) {
                    reject(this._transformResponse(error));
                } else {
                    resolve(this._transformResponse(response));
                }
            });
        });
    }

    /**
     * @private
     * @param {Object} response
     * @return {Response<any>}
     */
    _transformResponse({ data: body, status, statusText }) {
        return {
            headers: {},
            body,
            status,
            statusText,
        };
    }
}
