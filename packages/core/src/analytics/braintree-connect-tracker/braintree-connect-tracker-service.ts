export default interface BraintreeConnectTrackerService {
    // TODO: remove this method when this method will be removed from checkout-js part
    trackStepViewed(step: string): void;
    customerPaymentMethodExecuted(): void;
    paymentComplete(): void;
    selectedPaymentMethod(methodId: string): void;
    walletButtonClick(methodId: string): void;
}
