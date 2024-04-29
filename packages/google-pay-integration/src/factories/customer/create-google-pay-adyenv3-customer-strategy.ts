import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayGateway from '../../gateways/google-pay-gateway';
import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayAdyenV3CustomerStrategy: CustomerStrategyFactory<GooglePayCustomerStrategy> = (
    paymentIntegrationService,
) => {
    const requestSender = createRequestSender();

    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayGateway('adyen', paymentIntegrationService),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayAdyenV3CustomerStrategy, [
    { id: 'googlepayadyenv3' },
]);
