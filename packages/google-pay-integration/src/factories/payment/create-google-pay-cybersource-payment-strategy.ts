import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayCybersourceGateway from '../../gateways/google-pay-cybersource-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayCybersourcePaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) =>
    new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayCybersourceGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayCybersourcePaymentStrategy, [
    { id: 'googlepaycybersourcev2' },
    { id: 'googlepaybnz' },
]);
