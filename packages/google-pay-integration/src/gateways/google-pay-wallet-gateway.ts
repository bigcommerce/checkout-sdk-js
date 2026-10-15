import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    GooglePayCardParameters,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
    GooglePayMerchantInfo,
} from '../types';

export interface GooglePayWalletTokenizationConfig {
    intentTypename: string;
    providerId: string;
    paymentType: string;
    methodId: string;
}

export default interface GooglePayWalletGateway {
    initialize(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        currencyCode: string,
    ): Promise<void>;
    getMerchantInfo(): GooglePayMerchantInfo;
    getCardParameters(): GooglePayCardParameters;
    getPaymentGatewayParameters(): GooglePayGatewayParameters;
    getTokenizationConfig(): GooglePayWalletTokenizationConfig;
}
