export default interface BigCommercePaymentsWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithBigCommercePaymentsWalletInitializeOptions {
    bigcommerce_paymentspaypal?: BigCommercePaymentsWalletInitializeOptions;
}
