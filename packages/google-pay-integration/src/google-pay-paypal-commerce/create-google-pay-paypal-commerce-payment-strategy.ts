import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../google-pay-payment-strategy';

import GooglePayPaypalCommerceGateway from './google-pay-paypal-commerce-gateway';
import GooglePayPaypalCommercePaymentStrategy from './google-pay-paypal-commerce-payment-strategy';

const createGooglePayPayPalCommercePaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) => {
    const payPalCommerceSdk = new PayPalCommerceSdk(getScriptLoader());

    return new GooglePayPaypalCommercePaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayPaypalCommerceGateway(paymentIntegrationService, payPalCommerceSdk),
            createRequestSender(),
            createFormPoster(),
        ),
        payPalCommerceSdk,
        createRequestSender(),
    );
};

export default toResolvableModule(createGooglePayPayPalCommercePaymentStrategy, [
    { id: 'googlepaypaypalcommerce' },
]);
