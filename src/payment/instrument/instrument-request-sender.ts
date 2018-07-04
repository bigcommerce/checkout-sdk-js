import { RequestSender, Response } from '@bigcommerce/request-sender';

import { mapToInternalAddress, Address } from '../../address';
import { RequestOptions } from '../../common/http-request';

import { InstrumentRequestContext } from './instrument';
import {
    InstrumentsResponseBody,
    InstrumentErrorResponseBody,
    RawInstrumentsResponseBody,
    RawInstrumentErrorResponseBody,
    VaultAccessTokenResponseBody,
} from './instrument-response-body';
import InstrumentResponseTransformer from './instrument-response-transformer';

export default class InstrumentRequestSender {
    private _transformer: InstrumentResponseTransformer;

    constructor(
        private _client: any,
        private _requestSender: RequestSender
    ) {
        this._transformer = new InstrumentResponseTransformer();
    }

    getVaultAccessToken({ timeout }: RequestOptions = {}): Promise<Response<VaultAccessTokenResponseBody>> {
        const url = '/internalapi/v1/checkout/payments/vault-access-token';

        return this._requestSender.get(url, { timeout });
    }

    loadInstruments(requestContext: InstrumentRequestContext, shippingAddress?: Address): Promise<Response<InstrumentsResponseBody | InstrumentErrorResponseBody>> {
        return (shippingAddress) ?
            this._loadInstrumentsWithAddress(requestContext, shippingAddress) :
            this._loadInstruments(requestContext);
    }

    deleteInstrument(requestContext: InstrumentRequestContext, instrumentId: string): Promise<Response<InstrumentsResponseBody | InstrumentErrorResponseBody>> {
        const payload = {
            ...requestContext,
            instrumentId,
        };

        return new Promise((resolve, reject) => {
            this._client.deleteShopperInstrument(payload, (error: Response<RawInstrumentErrorResponseBody>, response: Response<RawInstrumentsResponseBody>) => {
                if (error) {
                    reject(this._transformer.transformErrorResponse(error));
                } else {
                    resolve(this._transformer.transformResponse(response));
                }
            });
        });
    }

    private _loadInstruments(requestContext: InstrumentRequestContext): Promise<Response<InstrumentsResponseBody | InstrumentErrorResponseBody>> {
        return new Promise((resolve, reject) => {
            this._client.loadInstruments(requestContext, (error: Response<RawInstrumentErrorResponseBody>, response: Response<RawInstrumentsResponseBody>) => {
                if (error) {
                    reject(this._transformer.transformErrorResponse(error));
                } else {
                    resolve(this._transformer.transformResponse(response));
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
            this._client.loadInstrumentsWithAddress(payload, (error: Response<RawInstrumentErrorResponseBody>, response: Response<RawInstrumentsResponseBody>) => {
                if (error) {
                    reject(this._transformer.transformErrorResponse(error));
                } else {
                    resolve(this._transformer.transformResponse(response));
                }
            });
        });
    }
}
