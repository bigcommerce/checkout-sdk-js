import MissingShippingMethodError from './missing-shipping-method-error';

describe('MissingShippingMethodError', () => {
    it('returns error name', () => {
        const error = new MissingShippingMethodError('error');

        expect(error.name).toBe('MissingShippingMethodError');
    });
});
