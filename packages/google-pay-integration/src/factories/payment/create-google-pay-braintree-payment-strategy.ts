import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayBraintreeGateway from '../../gateways/google-pay-braintree-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayBraintreePaymentStrategy: PaymentStrategyFactory<GooglePayPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const requestSender = createRequestSender();

    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
    );

    return new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayBraintreeGateway(paymentIntegrationService, braintreeSdk),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayBraintreePaymentStrategy, [
    { id: 'googlepaybraintree' },
]);
