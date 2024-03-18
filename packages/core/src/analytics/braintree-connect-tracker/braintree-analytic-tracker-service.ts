export default interface BraintreeAnalyticTrackerService {
    customerPaymentMethodExecuted(): void;
    paymentComplete(): void;
    selectedPaymentMethod(methodId: string): void;
    walletButtonClick(methodId: string): void;
}
