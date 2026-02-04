import { RequestOptions } from '../common/http-request';

export { WalletButtonInitializeOptions } from '../generated/wallet-button-initialize-options';

enum CheckoutButtonMethodType {
    PAYPALCOMMERCE = 'paypalcommercepaypal',
    PAYPLCOMMERCEVENMO = 'paypalcommercevenmo',
    PAYPALCOMMERCEPAYPALCREDIT = 'paypalcommercepaypalcredit',
}

export interface WalletButtonOptions extends RequestOptions {
    methodId: CheckoutButtonMethodType;
}

export interface BaseWalletButtonInitializeOptions extends WalletButtonOptions {
    [key: string]: unknown;

    containerId: string;
}
