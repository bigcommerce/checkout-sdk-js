import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';

import GooglePayWalletGateway, {
    GooglePayWalletRedirectData,
} from '../gateways/google-pay-wallet-gateway';
import assertsIsGooglePayPayPalCommercePaymentMethod from '../guards/is-google-pay-paypal-commerce-payment-method';
import {
    GooglePayCardDataResponse,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
} from '../types';

export default class GooglePayBigCommercePaymentsWalletGateway implements GooglePayWalletGateway {
    private gatewayIdentifier?: string;
    private gatewayMerchantId?: string;

    constructor(private payPalSdkScriptLoader: PayPalSdkScriptLoader) {}

    async initialize(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        currencyCode: string,
    ): Promise<void> {
        if (!paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        assertsIsGooglePayPayPalCommercePaymentMethod(paymentMethod);

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

    getPaymentGatewayParameters(): GooglePayGatewayParameters {
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

    getRedirectData(response: GooglePayCardDataResponse): Promise<GooglePayWalletRedirectData> {
        const { tokenizationData, info } = response.paymentMethodData;
        const nonce = btoa(tokenizationData.token);
        const cardInformation = { type: info.cardNetwork, number: info.cardDetails };

        return Promise.resolve({
            paymentWalletData: { providerId: 'bigcommerce_payments.googlepay' },
            queryParams: [
                { key: 'payment_type', value: 'googlepay' },
                { key: 'provider', value: 'googlepay_bigcommerce_payments' },
                { key: 'nonce', value: nonce },
                { key: 'card_information', value: JSON.stringify(cardInformation) },
            ],
        });
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
