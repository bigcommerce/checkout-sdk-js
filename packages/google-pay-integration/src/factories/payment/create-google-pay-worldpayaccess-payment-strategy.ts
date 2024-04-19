import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayWorldpayAccessGateway from '../../gateways/google-pay-worldpayaccess-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayWorldpayAccessPaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) =>
    new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayWorldpayAccessGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayWorldpayAccessPaymentStrategy, [
    { id: 'googlepayworldpayaccess' },
]);
