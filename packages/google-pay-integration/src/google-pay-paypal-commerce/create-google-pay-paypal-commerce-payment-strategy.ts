import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../google-pay-payment-strategy';

import GooglePayPaypalCommerceGateway from './google-pay-paypal-commerce-gateway';
import GooglePayPaypalCommercePaymentStrategy from './google-pay-paypal-commerce-payment-strategy';
import PayPalCommerceScriptLoader from './google-pay-paypal-commerce-script-loader';

const createGooglePayPayPalCommercePaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) => {
    const scriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

    return new GooglePayPaypalCommercePaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayPaypalCommerceGateway(paymentIntegrationService, scriptLoader),
            createRequestSender(),
            createFormPoster(),
        ),
        scriptLoader,
        createRequestSender(),
    );
};

export default toResolvableModule(createGooglePayPayPalCommercePaymentStrategy, [
    { id: 'googlepaypaypalcommerce' },
]);
