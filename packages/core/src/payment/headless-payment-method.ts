export default interface HeadlessPaymentMethod<T = any> {
    paymentWalletWithInitializationData: {
        clientToken?: string;
        initializationData?: T;
    };
}
