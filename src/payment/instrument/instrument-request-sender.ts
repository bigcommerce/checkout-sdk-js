import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class InstrumentRequestSender {
    /**
     * @constructor
     * @param {BigpayClient} client
     * @param {RequestSender} requestSender
     */
    constructor(
        private _client: any,
        private _requestSender: RequestSender
    ) {}

    getVaultAccessToken({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/payments/vault-access-token';

        return this._requestSender.get(url, { timeout });
    }

    getInstruments(storeId: string, shopperId: number, authToken: string): Promise<Response> {
        const payload = { storeId, shopperId, authToken };

        return new Promise((resolve, reject) => {
            this._client.getShopperInstruments(payload, (error: any, response: any) => {
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
     * @param {number} shopperId
     * @param {InstrumentRequestBody} instrument
     * @param {string} authToken
     * @return {Promise<Response<InstrumentResponseBody>>}
     */
    vaultInstrument(storeId: string, shopperId: number, instrument: any, authToken: string): Promise<Response> {
        const payload = {
            storeId,
            shopperId,
            authToken,
            instrument,
        };

        return new Promise((resolve, reject) => {
            this._client.postShopperInstrument(payload, (error: Error, response: any) => {
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
     * @param {number} shopperId
     * @param {string} authToken
     * @param {string} instrumentId
     * @return {Promise<void>}
     */
    deleteInstrument(storeId: string, shopperId: number, authToken: string, instrumentId: string): Promise<Response> {
        const payload = { storeId, shopperId, authToken, instrumentId };

        return new Promise((resolve, reject) => {
            this._client.deleteShopperInstrument(payload, (error: any, response: any) => {
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
    private _transformResponse({ data: body, status, statusText }: any): Response {
        return {
            headers: {},
            body,
            status,
            statusText,
        };
    }
}
