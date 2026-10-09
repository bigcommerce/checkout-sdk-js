import {
    BigCommercePaymentsInitializationData,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayWalletGateway, {
    GooglePayWalletTokenizationConfig,
} from '../gateways/google-pay-wallet-gateway';
import isGooglePayCardNetworkKey from '../guards/is-google-pay-card-network-key';
import {
    GooglePayCardNetwork,
    GooglePayCardParameters,
    GooglePayInitializationData,
    GooglePayMerchantInfo,
    GooglePayRegularGatewayParameters,
} from '../types';

import { PayPalSDK } from './types';

const TOKENIZATION_CONFIG: GooglePayWalletTokenizationConfig = {
    intentTypename: 'BigcommercePaymentWalletIntentData',
    providerId: 'bigcommerce_payments.googlepay',
    paymentType: 'googlepay',
    methodId: 'googlepay_bigcommerce_payments',
};

export default class GooglePayBigCommercePaymentsWalletGateway implements GooglePayWalletGateway {
    private payPalSdk?: PayPalSDK;
    private paymentMethod?: PaymentMethod<GooglePayInitializationData>;
    private gatewayIdentifier = 'googlepay_bigcommerce_payments';
    private gatewayMerchantId?: string;

    constructor(private payPalSdkHelper: PayPalSdkHelper) {}

    async initialize(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        currencyCode: string,
    ): Promise<void> {
        if (!paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.paymentMethod = paymentMethod;

        this.payPalSdk = (await this.payPalSdkHelper.getPayPalGooglePaySdk(
            paymentMethod as PaymentMethod<BigCommercePaymentsInitializationData>,
            currencyCode,
            false,
        )) as PayPalSDK;

        const googlepayConfig = await this.payPalSdk.Googlepay().config();
        const { tokenizationSpecification } = googlepayConfig.allowedPaymentMethods[0];

        this.gatewayIdentifier = tokenizationSpecification.parameters.gateway;
        this.gatewayMerchantId = tokenizationSpecification.parameters.gatewayMerchantId;
    }

    getMerchantInfo(): GooglePayMerchantInfo {
        const {
            googleMerchantName: merchantName,
            googleMerchantId: merchantId,
            platformToken: authJwt,
        } = this.getInitializationData();

        return { merchantName, merchantId, authJwt };
    }

    getCardParameters(): GooglePayCardParameters {
        const allowedCardNetworks = this.getPaymentMethodOrThrow()
            .supportedCards.filter(isGooglePayCardNetworkKey)
            .map((key) => GooglePayCardNetwork[key]);

        return {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks,
            billingAddressRequired: true,
            billingAddressParameters: {
                format: 'FULL',
                phoneNumberRequired: true,
            },
        };
    }

    getPaymentGatewayParameters(): GooglePayRegularGatewayParameters {
        if (!this.gatewayMerchantId) {
            throw new InvalidArgumentError('Unable to proceed, gatewayMerchantId is missing.');
        }

        return {
            gateway: this.gatewayIdentifier,
            gatewayMerchantId: this.gatewayMerchantId,
        };
    }

    getTokenizationConfig(): GooglePayWalletTokenizationConfig {
        return TOKENIZATION_CONFIG;
    }

    private getInitializationData(): GooglePayInitializationData {
        const { initializationData } = this.getPaymentMethodOrThrow();

        if (!initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return initializationData;
    }

    private getPaymentMethodOrThrow(): PaymentMethod<GooglePayInitializationData> {
        if (!this.paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this.paymentMethod;
    }
}
