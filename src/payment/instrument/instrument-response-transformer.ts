import { Response } from '@bigcommerce/request-sender';

import Instrument from './instrument';
import {
    InstrumentsResponseBody,
    InstrumentErrorResponseBody,
    RawInstrumentsResponseBody,
    RawInstrumentErrorResponseBody,
    RawInstrumentResponseBody,
} from './instrument-response-body';

export default class InstrumentResponseTransformer {
    transformResponse(response: Response<RawInstrumentsResponseBody>): Response<InstrumentsResponseBody> {
        const payload = this._transformResponse(response);
        const { vaulted_instruments } = payload.body;

        payload.body = {
            vaultedInstruments: this._transformVaultedInstruments(vaulted_instruments),
        };

        return payload;
    }

    transformErrorResponse(response: Response<RawInstrumentErrorResponseBody>): Response<InstrumentErrorResponseBody> {
        return this._transformResponse(response);
    }

    private _transformVaultedInstruments(vaultedInstruments: RawInstrumentResponseBody[] = []): Instrument[] {
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

    private _transformResponse({ data: body, status, statusText }: any): Response {
        return {
            headers: {},
            body,
            status,
            statusText,
        };
    }
}
