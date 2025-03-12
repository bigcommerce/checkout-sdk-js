export default interface PaypalCommerceHeadlessWalletInitializeOptions {
    cartId: string;
}

export interface WithPayPalCommerceHeadlessWalletInitializeOptions {
    paypalcommerce?: PaypalCommerceHeadlessWalletInitializeOptions;
}
