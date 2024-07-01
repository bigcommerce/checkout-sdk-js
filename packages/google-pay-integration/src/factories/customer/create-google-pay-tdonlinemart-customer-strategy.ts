import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayTdOnlineMartGateway from '../../gateways/google-pay-tdonlinemart-gateway';
import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayTdOnlineMartCustomerStrategy: CustomerStrategyFactory<
    GooglePayCustomerStrategy
> = (paymentIntegrationService) =>
    new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayTdOnlineMartGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayTdOnlineMartCustomerStrategy, [
    { id: 'googlepaytdonlinemart' },
]);
