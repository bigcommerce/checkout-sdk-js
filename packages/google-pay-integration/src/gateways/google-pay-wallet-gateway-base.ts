import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isGooglePayCardNetworkKey from '../guards/is-google-pay-card-network-key';
import {
    GooglePayCardNetwork,
    GooglePayCardParameters,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
    GooglePayMerchantInfo,
} from '../types';

import GooglePayWalletGateway, {
    GooglePayWalletTokenizationConfig,
} from './google-pay-wallet-gateway';

export default abstract class GooglePayWalletGatewayBase implements GooglePayWalletGateway {
    private paymentMethod?: PaymentMethod<GooglePayInitializationData>;

    async initialize(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        currencyCode: string,
    ): Promise<void> {
        if (!paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.paymentMethod = paymentMethod;

        await this.initializeProvider(paymentMethod, currencyCode);
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

    protected getPaymentMethodOrThrow(): PaymentMethod<GooglePayInitializationData> {
        if (!this.paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this.paymentMethod;
    }

    private getInitializationData(): GooglePayInitializationData {
        const { initializationData } = this.getPaymentMethodOrThrow();

        if (!initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return initializationData;
    }

    abstract getPaymentGatewayParameters(): GooglePayGatewayParameters;

    abstract getTokenizationConfig(): GooglePayWalletTokenizationConfig;

    protected abstract initializeProvider(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        currencyCode: string,
    ): Promise<void>;
}
