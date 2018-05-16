import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../../common/http-request';

import Instrument, { InstrumentRequestContext } from './instrument';
import { InstrumentsResponseBody, InstrumentResponseBody, VaultAccessTokenResponseBody } from './instrument-response-body';

export default class InstrumentRequestSender {
    constructor(
        private _client: any,
        private _requestSender: RequestSender
    ) {}

    getVaultAccessToken({ timeout }: RequestOptions = {}): Promise<Response<VaultAccessTokenResponseBody>> {
        const url = '/internalapi/v1/checkout/payments/vault-access-token';

        return this._requestSender.get(url, { timeout });
    }

    getInstruments(requestContext: InstrumentRequestContext): Promise<Response<InstrumentsResponseBody>> {
        return new Promise((resolve, reject) => {
            this._client.getShopperInstruments(requestContext, (error: Error, response: any) => {
                if (error) {
                    reject(this._transformResponse(error));
                } else {
                    resolve(this._transformResponse(response));
                }
            });
        });
    }

    vaultInstrument(requestContext: InstrumentRequestContext, instrument: Instrument): Promise<Response<InstrumentResponseBody>> {
        const payload = {
            ...requestContext,
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

    deleteInstrument(requestContext: InstrumentRequestContext, instrumentId: string): Promise<Response> {
        const payload = {
            ...requestContext,
            instrumentId,
        };

        return new Promise((resolve, reject) => {
            this._client.deleteShopperInstrument(payload, (error: Error, response: any) => {
                if (error) {
                    reject(this._transformResponse(error));
                } else {
                    resolve(this._transformResponse(response));
                }
            });
        });
    }

    private _transformResponse({ data: body, status, statusText }: any): Response {
        return {
            headers: {},
            body,
            status,
            statusText,
        };
    }
}
