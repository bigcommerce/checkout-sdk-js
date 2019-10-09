import { mapToCardInstrument } from './map-to-card-instrument';

describe('mapToCardInstrument', () => {
    it('returns a CardInstrument from a CardInternalInstrument', () => {
        const result = mapToCardInstrument({
            bigpay_token: 'my-bigpay-token',
            trusted_shipping_address: true,
            provider: 'braintree',
            method_type: 'card',
            last_4: '4111',
            iin: '4242',
            expiry_year: '2020',
            expiry_month: '12',
            default_instrument: false,
            brand: 'VISA',
        });

        expect(result).toEqual({
            bigpayToken: 'my-bigpay-token',
            brand: 'VISA',
            trustedShippingAddress: true,
            provider: 'braintree',
            method: 'card',
            last4: '4111',
            iin: '4242',
            expiryYear: '2020',
            expiryMonth: '12',
            defaultInstrument: false,
            type: 'card',
        });
    });
});
