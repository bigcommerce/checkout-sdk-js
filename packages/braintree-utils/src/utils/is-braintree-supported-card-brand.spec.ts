import { isBraintreeSupportedCardBrand } from './is-braintree-supported-card-brand';

describe('isBraintreeSupportedCardBrand', () => {
    it('returns true if card brand is supported', () => {
        const supportedCardBrand = 'mastercard';
        const unsupportedCardBrand = 'fakebank';

        expect(isBraintreeSupportedCardBrand(supportedCardBrand)).toBe(true);
        expect(isBraintreeSupportedCardBrand(unsupportedCardBrand)).toBe(false);
    });
});
