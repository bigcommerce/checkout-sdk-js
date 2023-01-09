import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Address, mapToInternalAddress } from '../../address';
import { RequestOptions } from '../../common/http-request';
import PaymentResponse from '../payment-response';

import { InstrumentRequestContext, VaultAccessToken } from './instrument';
import {
    InstrumentsResponseBody,
    InternalInstrumentErrorResponseBody,
    InternalInstrumentsResponseBody,
    InternalVaultAccessTokenResponseBody,
} from './instrument-response-body';
import InstrumentResponseTransformer from './instrument-response-transformer';

export default class InstrumentRequestSender {
    private _transformer: InstrumentResponseTransformer;

    constructor(private _client: any, private _requestSender: RequestSender) {
        this._transformer = new InstrumentResponseTransformer();
    }

    getVaultAccessToken({ timeout }: RequestOptions = {}): Promise<Response<VaultAccessToken>> {
        const url = '/internalapi/v1/checkout/payments/vault-access-token';

        return this._requestSender
            .get<InternalVaultAccessTokenResponseBody>(url, { timeout })
            .then((response) => ({
                ...response,
                body: {
                    vaultAccessToken: response.body.data.token,
                    vaultAccessExpiry: response.body.data.expires_at,
                },
            }));
    }

    loadInstruments(
        requestContext: InstrumentRequestContext,
        shippingAddress?: Address | Address[],
    ): Promise<Response<InstrumentsResponseBody>> {
        return shippingAddress
            ? this._loadInstrumentsWithAddress(requestContext, shippingAddress)
            : this._loadInstruments(requestContext);
    }

    deleteInstrument(
        requestContext: InstrumentRequestContext,
        instrumentId: string,
    ): Promise<Response<InstrumentsResponseBody>> {
        const payload = {
            ...requestContext,
            instrumentId,
        };

        return new Promise((resolve, reject) => {
            this._client.deleteShopperInstrument(
                payload,
                (
                    errorResponse: PaymentResponse<InternalInstrumentErrorResponseBody>,
                    response: PaymentResponse<InternalInstrumentsResponseBody>,
                ) =>
                    errorResponse
                        ? reject(this._transformer.transformErrorResponse(errorResponse))
                        : resolve(this._transformer.transformResponse(response)),
            );
        });
    }

    private _loadInstruments(
        requestContext: InstrumentRequestContext,
    ): Promise<Response<InstrumentsResponseBody>> {
        return new Promise((resolve, reject) => {
            this._client.loadInstruments(
                requestContext,
                (
                    errorResponse: PaymentResponse<InternalInstrumentErrorResponseBody>,
                    response: PaymentResponse<InternalInstrumentsResponseBody>,
                ) =>
                    errorResponse
                        ? reject(this._transformer.transformErrorResponse(errorResponse))
                        : resolve(this._transformer.transformResponse(response)),
            );
        });
    }

    private _loadInstrumentsWithAddress(
        requestContext: InstrumentRequestContext,
        shippingAddress: Address | Address[],
    ): Promise<Response<InstrumentsResponseBody>> {
        const payload = {
            ...requestContext,
            shippingAddress: Array.isArray(shippingAddress)
                ? shippingAddress.map((address) => mapToInternalAddress(address))
                : mapToInternalAddress(shippingAddress),
        };

        return new Promise((resolve, reject) => {
            this._client.loadInstrumentsWithAddress(
                payload,
                (
                    errorResponse: PaymentResponse<InternalInstrumentErrorResponseBody>,
                    response: PaymentResponse<InternalInstrumentsResponseBody>,
                ) =>
                    errorResponse
                        ? reject(this._transformer.transformErrorResponse(errorResponse))
                        : resolve(this._transformer.transformResponse(response)),
            );
        });
    }
}
