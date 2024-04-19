import { mapToPayPalInstrument } from './map-to-paypal-instrument';

describe('mapToPayPalInstrument', () => {
    it('returns a PayPalInstrument from a PayPalInternalInstrument', () => {
        const result = mapToPayPalInstrument({
            bigpay_token: 'my-bigpay-token',
            trusted_shipping_address: true,
            provider: 'braintree',
            method_type: 'paypal',
            method: 'account',
            default_instrument: false,
            external_id: 'test@external-id.com',
        });

        expect(result).toEqual({
            bigpayToken: 'my-bigpay-token',
            trustedShippingAddress: true,
            provider: 'braintree',
            method: 'paypal',
            defaultInstrument: false,
            externalId: 'test@external-id.com',
            type: 'account',
        });
    });
});
