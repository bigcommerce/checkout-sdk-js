import MissingShippingMethodError from './missing-shipping-method-error';

describe('MissingShippingMethodError', () => {
    it('returns error name', () => {
        const error = new MissingShippingMethodError();

        expect(error.name).toBe('MissingShippingMethodError');
    });
});
