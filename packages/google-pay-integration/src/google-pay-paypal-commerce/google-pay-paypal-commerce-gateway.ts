import {
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayGateway from '../gateways/google-pay-gateway';
import {
    GooglePayCardDataResponse,
    GooglePayPayPalCommerceGatewayParameters,
    GooglePayPayPalCommerceInitializationData,
    GooglePaySetExternalCheckoutData,
} from '../types';

import PayPalCommerceScriptLoader from './google-pay-paypal-commerce-script-loader';
import { GooglePayConfig } from './types';

export default class GooglePayPaypalCommerceGateway extends GooglePayGateway {
    private googlepayConfig?: GooglePayConfig;
    private paymentMethod?: PaymentMethod<GooglePayPayPalCommerceInitializationData>;

    constructor(
        service: PaymentIntegrationService,
        private paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
    ) {
        super('paypalsb', service);
    }

    async initialize(
        getPaymentMethod: () => PaymentMethod<GooglePayPayPalCommerceInitializationData>,
    ): Promise<void> {
        await super.initialize(getPaymentMethod);

        this.paymentMethod = super.getPaymentMethod();

        const { clientToken, initializationData } = this.paymentMethod;
        const { merchantId, clientId } = initializationData || {};

        if (!merchantId || !clientToken || !clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.googlepayConfig = await this.paypalCommerceScriptLoader.getGooglePayConfigOrThrow(
            clientId,
            merchantId,
            clientToken,
        );
    }

    getPaymentGatewayParameters(): GooglePayPayPalCommerceGatewayParameters {
        if (this.googlepayConfig) {
            const { allowedPaymentMethods } = this.googlepayConfig;
            const { gatewayMerchantId } =
                allowedPaymentMethods[0].tokenizationSpecification.parameters;

            return {
                gateway: this.getGatewayIdentifier(),
                gatewayMerchantId,
            };
        }

        return {
            gateway: this.getGatewayIdentifier(),
        };
    }

    async mapToExternalCheckoutData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePaySetExternalCheckoutData> {
        const data = await super.mapToExternalCheckoutData(response);

        data.nonce = btoa(data.nonce);

        return data;
    }
}
