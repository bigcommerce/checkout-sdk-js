import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayBraintreeGateway from '../../gateways/google-pay-braintree-gateway';
import GooglePayButtonStrategy from '../../google-pay-button-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayBraintreeButtonStrategy: CheckoutButtonStrategyFactory<
    GooglePayButtonStrategy
> = (paymentIntegrationService) => {
    const requestSender = createRequestSender();

    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(
            getScriptLoader(),
            braintreeHostWindow,
            braintreeSDKVersionManager,
        ),
    );

    return new GooglePayButtonStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayBraintreeGateway(paymentIntegrationService, braintreeSdk),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayBraintreeButtonStrategy, [
    { id: 'googlepaybraintree' },
]);
