import { RequestSender, Response } from '@bigcommerce/request-sender';

import { mapToInternalAddress, Address } from '../../address';
import { RequestOptions } from '../../common/http-request';

import { InstrumentRequestContext } from './instrument';
import { InstrumentsResponseBody, VaultAccessTokenResponseBody } from './instrument-response-body';

export default class InstrumentRequestSender {
    constructor(
        private _client: any,
        private _requestSender: RequestSender
    ) {}

    getVaultAccessToken({ timeout }: RequestOptions = {}): Promise<Response<VaultAccessTokenResponseBody>> {
        const url = '/internalapi/v1/checkout/payments/vault-access-token';

        return this._requestSender.get(url, { timeout });
    }

    loadInstruments(requestContext: InstrumentRequestContext, shippingAddress?: Address): Promise<Response<InstrumentsResponseBody>> {
        return (shippingAddress) ?
            this._loadInstrumentsWithAddress(requestContext, shippingAddress) :
            this._loadInstruments(requestContext);
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

    private _loadInstruments(requestContext: InstrumentRequestContext): Promise<Response<InstrumentsResponseBody>> {
        return new Promise((resolve, reject) => {
            this._client.loadInstruments(requestContext, (error: Error, response: any) => {
                if (error) {
                    reject(this._transformResponse(error));
                } else {
                    resolve(this._transformResponse(response));
                }
            });
        });
    }

    private _loadInstrumentsWithAddress(requestContext: InstrumentRequestContext, shippingAddress: Address): Promise<Response<InstrumentsResponseBody>> {
        const payload = {
            ...requestContext,
            shippingAddress: mapToInternalAddress(shippingAddress),
        };

        return new Promise((resolve, reject) => {
            this._client.loadInstrumentsWithAddress(payload, (error: Error, response: any) => {
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
