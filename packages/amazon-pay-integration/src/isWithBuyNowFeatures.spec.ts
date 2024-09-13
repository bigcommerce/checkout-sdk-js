import { isWithBuyNowFeatures } from './isWithBuyNowFeatures';

describe('isWithBuyNowFeatures', () => {
    it('should return true if options is WithBuyNowFeature', () => {
        const options = {
            buyNowInitializeOptions: {
                currencyCode: 'USD',
            },
        };

        expect(isWithBuyNowFeatures(options)).toBe(true);
    });

    it('should return false if options is not WithBuyNowFeature', () => {
        const options = {};

        expect(isWithBuyNowFeatures(options)).toBe(false);
    });

    it('should return false if options is not an object', () => {
        const options = 'string';

        expect(isWithBuyNowFeatures(options)).toBe(false);
    });
});
