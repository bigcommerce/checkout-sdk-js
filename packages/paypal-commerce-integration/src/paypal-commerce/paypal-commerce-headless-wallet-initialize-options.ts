export default interface PaypalCommerceHeadlessWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithPayPalCommerceHeadlessWalletInitializeOptions {
    paypalcommercepaypal?: PaypalCommerceHeadlessWalletInitializeOptions;
}
