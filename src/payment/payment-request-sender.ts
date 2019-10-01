import { Response } from '@bigcommerce/request-sender';

import PaymentRequestBody from './payment-request-body';

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

    submitPayment(payload: PaymentRequestBody): Promise<Response> {
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

    initializeOffsitePayment(payload: PaymentRequestBody, target?: string): Promise<void> {
        return new Promise(resolve => {
            this._client.initializeOffsitePayment(payload, undefined, target);
            // if the provider is a modal, resolve the promise.
            if (target) {
                resolve();
            }
        });
    }

    private _transformResponse(response: any): Response {
        return {
            headers: response.headers,
            body: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }
}
