import { CheckoutService } from '../../checkout';

import PayPalCommerceConnectTracker from './paypal-commerce-connect-tracker';
import PayPalCommerceConnectTrackerService from './paypal-commerce-connect-tracker-service';

/**
 * Creates an instance of `PayPalCommerceConnectTrackerService`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const paypalCommerceConnectTracker = createPayPalCommerceConnectTracker(checkoutService);
 *
 * paypalCommerceConnectTracker.customerPaymentMethodExecuted();
 * paypalCommerceConnectTracker.paymentComplete();
 * paypalCommerceConnectTracker.selectedPaymentMethod('applepay');
 * paypalCommerceConnectTracker.walletButtonClick('paypal');
 * ```
 *
 * @returns an instance of `PayPalCommerceConnectTrackerService`.
 */
export default function createPayPalCommerceConnectTracker(
    checkoutService: CheckoutService,
): PayPalCommerceConnectTrackerService {
    return new PayPalCommerceConnectTracker(checkoutService);
}
