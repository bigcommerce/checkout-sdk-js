import { createCheckoutService } from '../../checkout';

import BraintreeAnalyticTracker from './braintree-analytic-tracker';
import createBraintreeAnalyticTracker from './create-braintree-analytic-tracker';

describe('createBraintreeAnalyticTracker', () => {
    it('returns instance of BraintreeAnalyticTracker', () => {
        const checkoutService = createCheckoutService();

        expect(createBraintreeAnalyticTracker(checkoutService)).toBeInstanceOf(
            BraintreeAnalyticTracker,
        );
    });
});
