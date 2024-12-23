export default interface HeadlessPaymentMethod {
    paymentWalletWithInitializationData: {
        clientToken?: string;
        // INFO:: initializationData given in base64 format
        initializationData?: string;
    };
}
