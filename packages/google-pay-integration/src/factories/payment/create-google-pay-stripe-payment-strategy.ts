import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayStripeGateway from '../../gateways/google-pay-stripe-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';
import StripeUPEScriptLoader from '../../../../stripe-integration/src/stripe-upe/stripe-upe-script-loader';
import { getScriptLoader } from '@bigcommerce/script-loader';

const createGooglePayStripePaymentStrategy: PaymentStrategyFactory<GooglePayPaymentStrategy> = (
    paymentIntegrationService,
) =>
    new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayStripeGateway(paymentIntegrationService, new StripeUPEScriptLoader(getScriptLoader())),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayStripePaymentStrategy, [
    { id: 'googlepaystripe' },
    { id: 'googlepaystripeupe' },
]);
