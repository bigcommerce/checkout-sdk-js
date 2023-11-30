import { CheckoutService } from '../../checkout';

import BraintreeConnectTrackerService from './braintree-connect-tracker-service';
import BraintreeConnectTracker from './braintree-connect-tracker';

/**
 * Creates an instance of `BraintreeConnectTrackerService`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const braintreeConnectTracker = createBraintreeConnectTracker(checkoutService);
 *
 * braintreeConnectTracker.customerPaymentMethodExecuted();
 * braintreeConnectTracker.trackStepViewed('customer');
 * braintreeConnectTracker.paymentComplete();
 * braintreeConnectTracker.selectedPaymentMethod('applepay');
 * braintreeConnectTracker.walletButtonClick('paypal');
 * ```
 *
 * @returns an instance of `BraintreeConnectTrackerService`.
 */
export default function createBraintreeConnectTracker(checkoutService: CheckoutService): BraintreeConnectTrackerService {
    return new BraintreeConnectTracker(checkoutService);
}
