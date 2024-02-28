import { createCheckoutService } from '../../checkout';

import createPayPalCommerceAnalyticTracker from './create-paypal-commerce-analytic-tracker';
import PayPalCommerceAnalyticTracker from './paypal-commerce-analytic-tracker';

describe('createPayPalCommerceAnalyticTracker', () => {
    it('returns instance of PayPalCommerceAnalyticTracker', () => {
        const checkoutService = createCheckoutService();

        expect(createPayPalCommerceAnalyticTracker(checkoutService)).toBeInstanceOf(
            PayPalCommerceAnalyticTracker,
        );
    });
});
