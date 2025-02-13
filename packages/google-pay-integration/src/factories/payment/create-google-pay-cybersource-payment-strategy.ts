import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CardinalClient,
    CardinalScriptLoader,
    CardinalThreeDSecureFlowV2,
} from '@bigcommerce/checkout-sdk/cardinal-integration';
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
        new CardinalThreeDSecureFlowV2(
            paymentIntegrationService,
            new CardinalClient(new CardinalScriptLoader(getScriptLoader())),
        ),
    );

export default toResolvableModule(createGooglePayCybersourcePaymentStrategy, [
    { id: 'googlepaycybersourcev2' },
    { id: 'googlepaybnz' },
]);
