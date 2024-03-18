import { CheckoutService } from '../../checkout';

import BraintreeAnalyticTracker from './braintree-analytic-tracker';
import BraintreeAnalyticTrackerService from './braintree-analytic-tracker-service';

/**
 * Creates an instance of `BraintreeAnalyticTrackerService`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const braintreeAnalyticTracker = createBraintreeAnalyticTracker(checkoutService);
 *
 * braintreeAnalyticTracker.customerPaymentMethodExecuted();
 * braintreeAnalyticTracker.paymentComplete();
 * braintreeAnalyticTracker.selectedPaymentMethod('applepay');
 * braintreeAnalyticTracker.walletButtonClick('paypal');
 * ```
 *
 * @returns an instance of `BraintreeAnalyticTrackerService`.
 */
export default function createBraintreeAnalyticTracker(
    checkoutService: CheckoutService,
): BraintreeAnalyticTrackerService {
    return new BraintreeAnalyticTracker(checkoutService);
}
