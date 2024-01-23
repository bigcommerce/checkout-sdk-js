export default interface PayPalCommerceConnectTrackerService {
    customerPaymentMethodExecuted(): void;
    paymentComplete(): void;
    selectedPaymentMethod(methodId: string): void;
    walletButtonClick(methodId: string): void;
}
