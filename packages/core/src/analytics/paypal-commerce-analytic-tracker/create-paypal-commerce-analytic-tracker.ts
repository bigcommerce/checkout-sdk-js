import { CheckoutService } from '../../checkout';

import PayPalCommerceAnalyticTracker from './paypal-commerce-analytic-tracker';
import PayPalCommerceAnalyticTrackerService from './paypal-commerce-analytic-tracker-service';

/**
 * Creates an instance of `PayPalCommerceAnalyticTrackerService`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const paypalCommerceAnalyticTracker = createPayPalCommerceAnalyticTracker(checkoutService);
 *
 * paypalCommerceAnalyticTracker.customerPaymentMethodExecuted();
 * paypalCommerceAnalyticTracker.paymentComplete();
 * paypalCommerceAnalyticTracker.selectedPaymentMethod('applepay');
 * paypalCommerceAnalyticTracker.walletButtonClick('paypal');
 * ```
 *
 * @returns an instance of `PayPalCommerceAnalyticTrackerService`.
 */
export default function createPayPalCommerceAnalyticTracker(
    checkoutService: CheckoutService,
): PayPalCommerceAnalyticTrackerService {
    return new PayPalCommerceAnalyticTracker(checkoutService);
}
