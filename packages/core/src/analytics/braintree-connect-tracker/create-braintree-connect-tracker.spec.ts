import { createCheckoutService } from '../../checkout';

import createBraintreeConnectTracker from './create-braintree-connect-tracker';
import BraintreeConnectTracker from './braintree-connect-tracker';

describe('createBraintreeConnectTracker', () => {
    it('returns instance of BraintreeConnectTracker', () => {
        let checkoutService = createCheckoutService();

        expect(createBraintreeConnectTracker(checkoutService)).toBeInstanceOf(BraintreeConnectTracker);
    });
});
