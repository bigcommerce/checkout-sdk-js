export default interface BraintreeConnectTrackerService {
    selectedPaymentMethod(paymentOption?: string): void;
    walletButtonClicked(paymentOption?: string): void;
}
