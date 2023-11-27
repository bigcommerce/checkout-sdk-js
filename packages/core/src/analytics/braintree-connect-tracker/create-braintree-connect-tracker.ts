import BraintreeConnectTrackerService from './braintree-connect-tracker-service';
import BraintreeConnectTracker from './braintree-connect-tracker';

/**
 * Creates an instance of `BraintreeConnectTrackerService`.
 *
 * @remarks
 * ```js
 * const braintreeConnectTracker = createBraintreeConnectTracker();
 *
 * braintreeConnectTracker.selectedPaymentMethod('braintreepaypal');
 * braintreeConnectTracker.walletButtonClicked('applepay');
 * ```
 *
 * @returns an instance of `BraintreeConnectTrackerService`.
 */
export default function createBraintreeConnectTracker(): BraintreeConnectTrackerService {
    return new BraintreeConnectTracker();
}
