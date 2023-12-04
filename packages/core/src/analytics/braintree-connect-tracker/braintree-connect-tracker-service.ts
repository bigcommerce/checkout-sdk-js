export default interface BraintreeConnectTrackerService {
    trackStepViewed(step: string): void;
    customerPaymentMethodExecuted(): void;
    paymentComplete(): void;
    selectedPaymentMethod(methodId: string): void;
    walletButtonClick(methodId: string): void;
}
