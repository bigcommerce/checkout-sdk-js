import { Response } from '@bigcommerce/request-sender';

import PaymentResponse from '../payment-response';

import PaymentInstrument, { VaultAccessToken } from './instrument';
import { BankInternalInstrument, InstrumentsResponseBody, InstrumentErrorResponseBody, InternalInstrument, InternalInstrumentsResponseBody, InternalInstrumentErrorResponseBody, InternalVaultAccessTokenResponseBody, PayPalInternalInstrument } from './instrument-response-body';
import { mapToBankInstrument } from './map-to-bank-instrument';
import { mapToCardInstrument } from './map-to-card-instrument';
import { mapToPayPalInstrument } from './map-to-paypal-instrument';

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

    private _transformVaultedInstruments(vaultedInstruments: InternalInstrument[] = []): PaymentInstrument[] {
        return vaultedInstruments
            .map(instrument => {
                if (this._isPayPalInstrument(instrument)) {
                    return mapToPayPalInstrument(instrument);
                }

                if (this._isBankInstrument(instrument)) {
                    return mapToBankInstrument(instrument);
                }

                return mapToCardInstrument(instrument);
            });
    }

    private _isPayPalInstrument(instrument: InternalInstrument): instrument is PayPalInternalInstrument {
        return instrument.method_type === 'paypal';
    }

    private _isBankInstrument(instrument: InternalInstrument): instrument is BankInternalInstrument {
        return instrument.method_type === 'bank';
    }

    private _transformResponse<T>(response: PaymentResponse<T>): Response<T> {
        const { data: body, ...payload } = response;

        return {
            ...payload,
            body,
        };
    }
}
