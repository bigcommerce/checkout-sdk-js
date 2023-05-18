import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayAuthorizeNetGateway from '../../gateways/google-pay-authorizenet-gateway';
import GooglePayButtonStrategy from '../../google-pay-button-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayAuthorizeNetButtonStrategy: CheckoutButtonStrategyFactory<
    GooglePayButtonStrategy
> = (paymentIntegrationService) =>
    new GooglePayButtonStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayAuthorizeNetGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayAuthorizeNetButtonStrategy, [
    { id: 'googlepayauthorizenet' },
]);
