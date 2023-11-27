import BraintreeConnectTrackerService from './braintree-connect-tracker-service';

export default class BraintreeConnectTracker implements BraintreeConnectTrackerService {
    customerPaymentMethodExecuted() {
        console.log('BraintreeConnectTracker: customerPaymentMethodExecuted');
    }

    trackStepViewed(step: string) {
        console.log('BraintreeConnectTracker: trackStepViewed', step);
    }

    paymentComplete() {
        console.log('BraintreeConnectTracker: paymentComplete');
    }

    selectedPaymentMethod(methodId?: string, methodName?: string) {
        console.log('BraintreeConnectTracker: selectedPaymentMethod', methodName, methodId);
    }

    walletButtonClick(methodName?: string) {
        console.log('BraintreeConnectTracker: walletButtonClick', methodName);
    }
}
