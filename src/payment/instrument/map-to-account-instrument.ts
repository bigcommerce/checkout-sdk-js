import { AccountInstrument } from './instrument';
import { AccountInternalInstrument } from './instrument-response-body';

export function mapToAccountInstrument(instrument: AccountInternalInstrument): AccountInstrument {
    return {
        bigpayToken: instrument.bigpay_token,
        defaultInstrument: instrument.default_instrument,
        provider: instrument.provider,
        externalId: instrument.external_id,
        trustedShippingAddress: instrument.trusted_shipping_address,
        method: instrument.method,
        type: instrument.method_type,
        iban: instrument.iban,
        issuer: instrument.issuer,
    };
}
