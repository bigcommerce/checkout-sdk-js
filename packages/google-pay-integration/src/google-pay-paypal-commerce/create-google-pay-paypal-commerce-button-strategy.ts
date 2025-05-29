import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayButtonStrategy from '../google-pay-button-strategy';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';

import GooglePayPaypalCommerceGateway from './google-pay-paypal-commerce-gateway';

const createGooglePayPayPalCommerceButtonStrategy: CheckoutButtonStrategyFactory<
    GooglePayButtonStrategy
> = (paymentIntegrationService) => {
    return new GooglePayButtonStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayPaypalCommerceGateway(
                paymentIntegrationService,
                new PayPalCommerceSdk(getScriptLoader()),
            ),
            createRequestSender(),
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayPayPalCommerceButtonStrategy, [
    { id: 'googlepaypaypalcommerce' },
]);
