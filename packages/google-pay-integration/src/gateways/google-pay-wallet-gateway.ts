import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RedirectToCheckoutUrlInputData } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import {
    GooglePayCardDataResponse,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
    GooglePayMerchantInfo,
    GooglePayTransactionInfo,
} from '../types';

export type GooglePayWalletRedirectData = Omit<RedirectToCheckoutUrlInputData, 'cartEntityId'>;

export default interface GooglePayWalletGateway {
    initialize(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        currencyCode: string,
    ): Promise<void>;

    getPaymentGatewayParameters(
        merchantInfo: GooglePayMerchantInfo,
        transactionInfo: GooglePayTransactionInfo,
    ): GooglePayGatewayParameters;

    getRedirectData(
        response: GooglePayCardDataResponse,
        cartId: string,
    ): Promise<GooglePayWalletRedirectData>;

    deinitialize(): Promise<void>;
}
