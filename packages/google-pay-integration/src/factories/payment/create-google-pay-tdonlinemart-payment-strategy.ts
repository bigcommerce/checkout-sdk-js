import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayTdOnlineMartGateway from '../../gateways/google-pay-tdonlinemart-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayTdOnlineMartPaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) =>
    new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayTdOnlineMartGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayTdOnlineMartPaymentStrategy, [
    { id: 'googlepaytdonlinemart' },
]);
