import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import assertsIsGooglePayAuthorizeNetInitializationData from '../guards/is-google-pay-authorizenet-initialization-data';
import {
    GooglePayCardDataResponse,
    GooglePayGatewayParameters,
    GooglePaySetExternalCheckoutData,
} from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayAuthorizeNetGateway extends GooglePayGateway {
    constructor(service: PaymentIntegrationService) {
        super('authorizenet', service);
    }

    async mapToExternalCheckoutData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePaySetExternalCheckoutData> {
        const data = await super.mapToExternalCheckoutData(response);

        data.nonce = btoa(data.nonce);

        return data;
    }

    getPaymentGatewayParameters(): GooglePayGatewayParameters {
        const data = this.getGooglePayInitializationData();

        assertsIsGooglePayAuthorizeNetInitializationData(data);

        return {
            gateway: this.getGatewayIdentifier(),
            gatewayMerchantId: data.paymentGatewayId,
        };
    }
}
