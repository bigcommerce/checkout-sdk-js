export default interface PayPalCommerceCreditWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithPayPalCommerceCreditWalletInitializeOptions {
    paypalcommercepaypalcredit?: PayPalCommerceCreditWalletInitializeOptions;
}
