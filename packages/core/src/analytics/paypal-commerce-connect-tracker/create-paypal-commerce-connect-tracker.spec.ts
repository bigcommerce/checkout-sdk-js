import { createCheckoutService } from '../../checkout';

import createPayPalCommerceConnectTracker from './create-paypal-commerce-connect-tracker';
import PayPalCommerceConnectTracker from './paypal-commerce-connect-tracker';

describe('createPayPalCommerceConnectTracker', () => {
    it('returns instance of PayPalCommerceConnectTracker', () => {
        const checkoutService = createCheckoutService();

        expect(createPayPalCommerceConnectTracker(checkoutService)).toBeInstanceOf(
            PayPalCommerceConnectTracker,
        );
    });
});
