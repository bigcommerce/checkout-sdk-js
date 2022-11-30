import OrderTaxProviderUnavailableError from './order-tax-provider-unavailable-error';

describe('OrderTaxProviderUnavailableError', () => {
    it('returns error name', () => {
        const error = new OrderTaxProviderUnavailableError();

        expect(error.name).toBe('OrderTaxProviderUnavailableError');
    });
});
