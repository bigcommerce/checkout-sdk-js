import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayCheckoutComGateway from '../../gateways/google-pay-checkoutcom-gateway';
import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayCheckoutComCustomerStrategy: CustomerStrategyFactory<
    GooglePayCustomerStrategy
> = (paymentIntegrationService) => {
    const requestSender = createRequestSender();

    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayCheckoutComGateway(paymentIntegrationService, requestSender),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayCheckoutComCustomerStrategy, [
    { id: 'googlepaycheckoutcom' },
]);
