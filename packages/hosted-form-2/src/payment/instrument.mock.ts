import { CardInstrument, UntrustedShippingCardVerificationType } from "./instrument";

export function getCardInstrument(): CardInstrument {
    return {
        bigpayToken: '123',
        provider: 'braintree',
        iin: '11111111',
        last4: '1111',
        expiryMonth: '02',
        expiryYear: '2020',
        brand: 'visa',
        trustedShippingAddress: true,
        defaultInstrument: true,
        method: 'card',
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
        type: 'card',
    };
}