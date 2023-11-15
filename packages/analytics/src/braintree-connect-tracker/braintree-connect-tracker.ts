import BraintreeConnectTrackerService from './braintree-connect-tracker-service';

export default class BraintreeConnectTracker implements BraintreeConnectTrackerService {
    selectedPaymentMethod(methodName?: string) {
        console.log('BraintreeConnectTracker: selectedPaymentMethod', methodName);
    }

    walletButtonClicked(methodName?: string) {
        console.log('BraintreeConnectTracker: walletButtonClicked', methodName);
    }
}
