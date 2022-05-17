import { PayPalInstrument } from './instrument';
import { PayPalInternalInstrument } from './instrument-response-body';

export function mapToPayPalInstrument(instrument: PayPalInternalInstrument): PayPalInstrument {
    return {
        bigpayToken: instrument.bigpay_token,
        defaultInstrument: instrument.default_instrument,
        provider: instrument.provider,
        externalId: instrument.external_id,
        trustedShippingAddress: instrument.trusted_shipping_address,
        method: 'paypal',
        type: 'account',
    };
}
