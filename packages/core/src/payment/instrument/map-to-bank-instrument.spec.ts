import { mapToBankInstrument } from './map-to-bank-instrument';

describe('mapToBankInstrument', () => {
    it('returns a BankInstrument from a BankInternalInstrument', () => {
        const result = mapToBankInstrument({
            bigpay_token: 'my-bigpay-token',
            trusted_shipping_address: true,
            provider: 'braintree',
            method_type: 'bank',
            method: 'account',
            default_instrument: false,
            account_number: '1234',
            iban: 'ZXY',
            issuer: 'Some Issuer',
            external_id: 'test@external-id.com',
        });

        expect(result).toEqual({
            bigpayToken: 'my-bigpay-token',
            trustedShippingAddress: true,
            provider: 'braintree',
            method: 'account',
            defaultInstrument: false,
            type: 'bank',
            accountNumber: '1234',
            iban: 'ZXY',
            issuer: 'Some Issuer',
            externalId: 'test@external-id.com',
        });
    });
});
