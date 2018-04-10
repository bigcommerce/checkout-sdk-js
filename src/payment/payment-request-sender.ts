import { Response } from '@bigcommerce/request-sender';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PaymentRequestSender {
    /**
     * @constructor
     * @param {BigpayClient} client
     */
    constructor(
        private _client: any
    ) {}

    /**
     * @param {PaymentRequestBody} payload
     * @return {Promise<Response<PaymentResponseBody>>}
     */
    submitPayment(payload: any): Promise<Response> {
        return new Promise((resolve, reject) => {
            this._client.submitPayment(payload, (error: any, response: any) => {
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
    initializeOffsitePayment(payload: any): Promise<void> {
        return new Promise(() => {
            this._client.initializeOffsitePayment(payload);
        });
    }

    private _transformResponse(response: any): Response {
        return {
            headers: {},
            body: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }
}
