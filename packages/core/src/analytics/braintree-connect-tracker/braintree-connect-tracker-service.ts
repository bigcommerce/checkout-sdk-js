export default interface BraintreeConnectTrackerService {
    trackStepViewed(step: string): void;
    customerPaymentMethodExecuted(): void;
    paymentComplete(): void;
    selectedPaymentMethod(methodId?: string, methodName?: string): void;
    walletButtonClick(methodId?: string): void;
}
