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
        untrustedShippingCardVerificationMode:
            instrument.untrusted_shipping_address_card_verification_mode,
        method: instrument.method,
        type: 'card',
    };
}
