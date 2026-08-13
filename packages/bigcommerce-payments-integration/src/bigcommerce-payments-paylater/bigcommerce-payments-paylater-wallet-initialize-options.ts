export default interface BigCommercePaymentsPayLaterWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
}

export interface WithBigCommercePaymentsPayLaterWalletInitializeOptions {
    bigcommerce_paymentspaypalcredit?: BigCommercePaymentsPayLaterWalletInitializeOptions;
}
