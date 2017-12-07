import { CheckoutClient } from './checkout';
import createCheckoutClient from './create-checkout-client';

describe('createCheckoutClient()', () => {
    it('creates an instance of CheckoutClient', () => {
        const checkoutClient = createCheckoutClient();

        expect(checkoutClient).toEqual(expect.any(CheckoutClient));
    });
});
