export default interface BigCommercePaymentsVenmoWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithBigCommercePaymentsVenmoWalletInitializeOptions {
    bigcommerce_paymentsvenmo?: BigCommercePaymentsVenmoWalletInitializeOptions;
}
