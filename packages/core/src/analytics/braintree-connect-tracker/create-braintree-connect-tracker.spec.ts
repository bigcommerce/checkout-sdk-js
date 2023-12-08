import { createCheckoutService } from '../../checkout';

import BraintreeConnectTracker from './braintree-connect-tracker';
import createBraintreeConnectTracker from './create-braintree-connect-tracker';

describe('createBraintreeConnectTracker', () => {
    it('returns instance of BraintreeConnectTracker', () => {
        const checkoutService = createCheckoutService();

        expect(createBraintreeConnectTracker(checkoutService)).toBeInstanceOf(
            BraintreeConnectTracker,
        );
    });
});
