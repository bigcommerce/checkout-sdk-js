export default interface PaypalCommerceWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithPayPalCommerceWalletInitializeOptions {
    paypalcommercepaypal?: PaypalCommerceWalletInitializeOptions;
}
