import { Response } from '@bigcommerce/request-sender';

import PaymentResponse from '../payment-response';

import Instrument, { VaultAccessToken } from './instrument';
import { InstrumentsResponseBody, InstrumentErrorResponseBody, InternalInstrument, InternalInstrumentsResponseBody, InternalInstrumentErrorResponseBody, InternalVaultAccessTokenResponseBody } from './instrument-response-body';

export default class InstrumentResponseTransformer {
    transformResponse(
        response: PaymentResponse<InternalInstrumentsResponseBody>
    ): Response<InstrumentsResponseBody> {
        const { body, ...payload } = this._transformResponse(response);

        return {
            ...payload,
            body: {
                vaultedInstruments: this._transformVaultedInstruments(body.vaulted_instruments),
            },
        };
    }

    transformErrorResponse(
        response: PaymentResponse<InternalInstrumentErrorResponseBody>
    ): Response<InstrumentErrorResponseBody> {
        return this._transformResponse(response);
    }

    transformVaultAccessResponse(
        response: Response<InternalVaultAccessTokenResponseBody>
    ): Response<VaultAccessToken> {
        return {
            ...response,
            body: {
                vaultAccessToken: response.body.data.token,
                vaultAccessExpiry: response.body.data.expires_at,
            },
        };
    }

    private _transformVaultedInstruments(vaultedInstruments: InternalInstrument[] = []): Instrument[] {
        return vaultedInstruments.map(instrument => ({
            bigpayToken: instrument.bigpay_token,
            defaultInstrument: instrument.default_instrument,
            provider: instrument.provider,
            iin: instrument.iin,
            last4: instrument.last_4,
            expiryMonth: instrument.expiry_month,
            expiryYear: instrument.expiry_year,
            brand: instrument.brand,
            trustedShippingAddress: instrument.trusted_shipping_address,
        }));
    }

    private _transformResponse<T>(response: PaymentResponse<T>): Response<T> {
        const { data: body, ...payload } = response;

        return {
            ...payload,
            body,
        };
    }
}
