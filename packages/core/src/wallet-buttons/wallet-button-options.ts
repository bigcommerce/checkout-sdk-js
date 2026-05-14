import { RequestOptions } from '../common/http-request';

export { WalletButtonInitializeOptions } from '../generated/wallet-button-initialize-options';

export enum WalletButtonMethodType {
    PAYPALCOMMERCE = 'paypalcommercepaypal',
    PAYPALCOMMERCEVENMO = 'paypalcommercevenmo',
    PAYPALCOMMERCEPAYPALCREDIT = 'paypalcommercepaypalcredit',
}

export interface WalletButtonOptions extends RequestOptions {
    methodId: WalletButtonMethodType;
}

export interface BaseWalletButtonInitializeOptions extends WalletButtonOptions {
    [key: string]: unknown;

    containerId: string;
}
