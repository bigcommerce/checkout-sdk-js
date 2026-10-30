import {
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';

import { GooglePayWalletTokenizationConfig } from '../gateways/google-pay-wallet-gateway';
import GooglePayWalletGatewayBase from '../gateways/google-pay-wallet-gateway-base';
import {
    GooglePayPayPalCommerceInitializationData,
    GooglePayRegularGatewayParameters,
} from '../types';

const TOKENIZATION_CONFIG: GooglePayWalletTokenizationConfig = {
    providerId: 'paypalcommerce.googlepay',
    paymentType: 'googlepay',
    methodId: 'paypalcommercegooglepay',
};

export default class GooglePayPayPalCommerceWalletGateway extends GooglePayWalletGatewayBase {
    private gatewayIdentifier?: string;
    private gatewayMerchantId?: string;

    constructor(private payPalSdkScriptLoader: PayPalSdkScriptLoader) {
        super();
    }

    getTokenizationConfig(): GooglePayWalletTokenizationConfig {
        return TOKENIZATION_CONFIG;
    }

    getPaymentGatewayParameters(): GooglePayRegularGatewayParameters {
        if (!this.gatewayMerchantId || !this.gatewayIdentifier) {
            throw new InvalidArgumentError(
                'Unable to proceed, gatewayMerchantId or gatewayIdentifier is missing.',
            );
        }

        return {
            gateway: this.gatewayIdentifier,
            gatewayMerchantId: this.gatewayMerchantId,
        };
    }

    protected async initializeProvider(
        paymentMethod: PaymentMethod<GooglePayPayPalCommerceInitializationData>,
        currencyCode: string,
    ): Promise<void> {
        const payPalGooglePaySdk = await this.payPalSdkScriptLoader.getPayPalGooglePaySdk(
            paymentMethod,
            currencyCode,
            undefined,
            false,
        );

        const googlePayConfig = await payPalGooglePaySdk.Googlepay().config();
        const tokenizationSpecification =
            googlePayConfig.allowedPaymentMethods[0]?.tokenizationSpecification;

        if (!tokenizationSpecification) {
            throw new Error('Google Pay tokenization specification is missing');
        }

        this.gatewayIdentifier = tokenizationSpecification.parameters.gateway;
        this.gatewayMerchantId = tokenizationSpecification.parameters.gatewayMerchantId;
    }
}
