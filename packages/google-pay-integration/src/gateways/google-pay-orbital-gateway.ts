import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayCardDataResponse, GooglePaySetExternalCheckoutData } from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayOrbitalGateway extends GooglePayGateway {
    constructor(service: PaymentIntegrationService) {
        super('chase', service);
    }

    async mapToExternalCheckoutData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePaySetExternalCheckoutData> {
        const data = await super.mapToExternalCheckoutData(response);

        data.nonce = btoa(data.nonce);

        return data;
    }
}
