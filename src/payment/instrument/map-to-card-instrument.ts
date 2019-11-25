import { CardInstrument } from './instrument';
import { CardInternalInstrument } from './instrument-response-body';

export function mapToCardInstrument(instrument: CardInternalInstrument): CardInstrument {
    return {
        bigpayToken: instrument.bigpay_token,
        defaultInstrument: instrument.default_instrument,
        provider: instrument.provider,
        iin: instrument.iin,
        last4: instrument.last_4,
        expiryMonth: instrument.expiry_month,
        expiryYear: instrument.expiry_year,
        brand: instrument.brand,
        trustedShippingAddress: instrument.trusted_shipping_address,
        method:  instrument.method === 'card' ? 'credit_card' : instrument.method, // This is a temporary change for the rollout of some changes in bigpay. It is meant to be removed when the changes in bigpay are fully rolled out
        type: 'card',
    };
}
