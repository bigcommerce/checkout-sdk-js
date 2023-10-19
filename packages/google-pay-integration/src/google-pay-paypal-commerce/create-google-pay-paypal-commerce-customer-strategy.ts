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

import GooglePayPaypalCommerceGateway from './google-pay-paypal-commerce-gateway';
import PayPalCommerceScriptLoader from './google-pay-paypal-commerce-script-loader';

const createGooglePayPayPalCommerceCustomerStrategy: CustomerStrategyFactory<
    GooglePayCustomerStrategy
> = (paymentIntegrationService) => {
    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayPaypalCommerceGateway(
                paymentIntegrationService,
                new PayPalCommerceScriptLoader(getScriptLoader()),
            ),
            createRequestSender(),
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayPayPalCommerceCustomerStrategy, [
    { id: 'googlepaypaypalcommerce' },
]);
