import { GooglePayButtonColor, GooglePayButtonType } from './types';

export default interface GooglePayWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
    };
    amount: number;
    initializationData: string;
    buttonColor?: GooglePayButtonColor;
    buttonType?: GooglePayButtonType;
}

export interface WithGooglePayWalletInitializeOptions {
    bigcommerce_paymentsgooglepay?: GooglePayWalletInitializeOptions;
}
