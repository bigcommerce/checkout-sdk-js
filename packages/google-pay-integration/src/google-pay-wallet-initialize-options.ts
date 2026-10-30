export default interface GooglePayWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    amount: number;
    initializationData: string;
    clientToken: string;
}

export interface WithGooglePayWalletInitializeOptions {
    bigcommerce_paymentsgooglepay?: GooglePayWalletInitializeOptions;
    paypalcommercegooglepay?: GooglePayWalletInitializeOptions;
}
