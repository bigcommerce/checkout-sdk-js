import { mapToAccountInstrument } from './map-to-account-instrument';

describe('mapToAccountInstrument', () => {
    it('returns a AccountInstrument from a AccountInternalInstrument', () => {
        const result = mapToAccountInstrument({
            bigpay_token: 'my-bigpay-token',
            trusted_shipping_address: true,
            provider: 'braintree',
            method_type: 'paypal',
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
