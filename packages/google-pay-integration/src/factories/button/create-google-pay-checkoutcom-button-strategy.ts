import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayCheckoutComGateway from '../../gateways/google-pay-checkoutcom-gateway';
import GooglePayButtonStrategy from '../../google-pay-button-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayCheckoutComButtonStrategy: CheckoutButtonStrategyFactory<
    GooglePayButtonStrategy
> = (paymentIntegrationService) => {
    const requestSender = createRequestSender();

    return new GooglePayButtonStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayCheckoutComGateway(paymentIntegrationService, requestSender),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayCheckoutComButtonStrategy, [
    { id: 'googlepaycheckoutcom' },
]);
