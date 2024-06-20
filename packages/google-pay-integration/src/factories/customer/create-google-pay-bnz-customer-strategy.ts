import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayCybersourceGateway from '../../gateways/google-pay-cybersource-gateway';
import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayBnzCustomerStrategy: CustomerStrategyFactory<GooglePayCustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayCybersourceGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayBnzCustomerStrategy, [{ id: 'googlepaybnz' }]);
