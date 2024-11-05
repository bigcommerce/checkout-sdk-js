import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayCustomerStrategy from '../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';

import GooglePayStripeGateway from './google-pay-stripe-gateway';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const createGooglePayStripeCustomerStrategy: CustomerStrategyFactory<GooglePayCustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayStripeGateway(
                paymentIntegrationService,
                new StripeUPEScriptLoader(getScriptLoader()),
            ),
            createRequestSender(),
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayStripeCustomerStrategy, [
    { id: 'googlepaystripe' },
]);
