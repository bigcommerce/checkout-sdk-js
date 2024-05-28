import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayBraintreeGateway from '../../gateways/google-pay-braintree-gateway';
import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayBraintreePaymentStrategy: CustomerStrategyFactory<
    GooglePayCustomerStrategy
> = (paymentIntegrationService) => {
    const requestSender = createRequestSender();

    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayBraintreeGateway(paymentIntegrationService, braintreeIntegrationService),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayBraintreePaymentStrategy, [
    { id: 'googlepaybraintree' },
]);
