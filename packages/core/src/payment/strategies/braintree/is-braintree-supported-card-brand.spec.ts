import { BraintreeSupportedCardBrands } from './braintree-payment-options';
import { isBraintreeSupportedCardBrand } from './is-braintree-supported-card-brand';

describe('isBraintreeSupportedCardBrand', () => {
    it('returns true for all supported card brands', () => {
        Object.values(BraintreeSupportedCardBrands).forEach((brand) => {
            expect(isBraintreeSupportedCardBrand(brand)).toBe(true);
        });
    });

    it('returns false for unsupported card brands', () => {
        expect(isBraintreeSupportedCardBrand('DISCOVER')).toBe(false);
        expect(isBraintreeSupportedCardBrand('MAESTRO')).toBe(false);
        expect(isBraintreeSupportedCardBrand('')).toBe(false);
        expect(isBraintreeSupportedCardBrand('random')).toBe(false);
    });
});
