import CheckoutService from './checkout-service';
import createCheckoutService from './create-checkout-service';

describe('createCheckoutService()', () => {
    it('creates an instance of CheckoutService', () => {
        const checkoutClient = jest.fn();
        const checkoutService = createCheckoutService({ client: checkoutClient });

        expect(checkoutService).toEqual(expect.any(CheckoutService));
    });

    it('creates an instance without optional params', () => {
        const checkoutService = createCheckoutService();

        expect(checkoutService).toEqual(expect.any(CheckoutService));
    });
});
