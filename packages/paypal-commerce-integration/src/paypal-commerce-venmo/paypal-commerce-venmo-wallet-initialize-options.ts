export default interface PayPalCommerceVenmoWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithPayPalCommerceVenmoWalletInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoWalletInitializeOptions;
}
