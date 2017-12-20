export default class InstrumentRequestSender {
    /**
     * @contructor
     * @param {BigpayClient} client
     */
    constructor(client) {
        this._client = client;
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @return {Promise<Response<ShopperTokenResponseBody>>}
     */
    getShopperToken(storeId, shopperId) {
        return new Promise((resolve, reject) => {
            const payload = { storeId, shopperId };

            this._client.getShopperToken(payload, (error, response) => {
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
