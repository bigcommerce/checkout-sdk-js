import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayAuthorizeNetGateway from '../../gateways/google-pay-authorizenet-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayAuthorizeNetPaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) =>
    new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayAuthorizeNetGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayAuthorizeNetPaymentStrategy, [
    { id: 'googlepayauthorizenet' },
]);
