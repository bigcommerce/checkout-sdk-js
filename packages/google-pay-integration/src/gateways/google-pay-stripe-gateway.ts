import {
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import assertsIsGooglePayStripeInitializationData from '../guards/is-google-pay-stripe-initialization-data';
import assertIsGooglePayStripeTokenObject from '../guards/is-google-pay-stripe-token-object';
import {
    GooglePayCardDataResponse,
    GooglePaySetExternalCheckoutData,
    GooglePayStripeGatewayParameters,
} from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayStripeGateway extends GooglePayGateway {
    constructor(service: PaymentIntegrationService) {
        super('stripe', service);
    }

    async mapToExternalCheckoutData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePaySetExternalCheckoutData> {
        const data = await super.mapToExternalCheckoutData(response);

        let token: unknown;

        try {
            token = JSON.parse(data.nonce);
        } catch (error) {
            throw new InvalidArgumentError('Unable to parse response from Google Pay.');
        }

        assertIsGooglePayStripeTokenObject(token);

        data.nonce = token.id;

        return data;
    }

    getPaymentGatewayParameters(): GooglePayStripeGatewayParameters {
        const data = this.getGooglePayInitializationData();

        assertsIsGooglePayStripeInitializationData(data);

        const { stripeVersion, stripePublishableKey, stripeConnectedAccount } = data;

        return {
            gateway: this.getGatewayIdentifier(),
            'stripe:version': stripeVersion,
            'stripe:publishableKey': `${stripePublishableKey}/${stripeConnectedAccount}`,
        };
    }
}
