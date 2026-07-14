export default interface PayPalCommerceWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithPayPalCommerceWalletInitializeOptions {
    paypalcommercepaypal?: PayPalCommerceWalletInitializeOptions;
}
