export default class PaymentRequestSender {
    /**
     * @contructor
     * @param {BigpayClient} client
     */
    constructor(client) {
        this._client = client;
    }

    /**
     * @param {PaymentRequestBody} payload
     * @return {Promise<Response<PaymentResponseBody>>}
     */
    submitPayment(payload) {
        return new Promise((resolve, reject) => {
            this._client.submitPayment(payload, (error, response) => {
                if (error) {
                    reject(this._transformResponse(error));
                } else {
                    resolve(this._transformResponse(response));
                }
            });
        });
    }

    /**
     * @param {PaymentRequestBody} payload
     * @return {Promise<void>}
     */
    initializeOffsitePayment(payload) {
        return new Promise(() => {
            this._client.initializeOffsitePayment(payload);
        });
    }

    /**
     * @private
     * @param {Object} response
     * @return {Response<any>}
     */
    _transformResponse(response) {
        return {
            headers: {},
            body: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }
}
