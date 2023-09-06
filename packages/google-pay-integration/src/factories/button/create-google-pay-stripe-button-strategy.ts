import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayStripeGateway from '../../gateways/google-pay-stripe-gateway';
import GooglePayButtonStrategy from '../../google-pay-button-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayStripeButtonStrategy: CheckoutButtonStrategyFactory<
    GooglePayButtonStrategy
> = (paymentIntegrationService) =>
    new GooglePayButtonStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayStripeGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayStripeButtonStrategy, [
    { id: 'googlepaystripe' },
    { id: 'googlepaystripeupe' },
]);
