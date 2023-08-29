import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayCheckoutComGateway from '../../gateways/google-pay-checkoutcom-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayCheckoutComPaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) => {
    const requestSender = createRequestSender();

    return new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayCheckoutComGateway(paymentIntegrationService, requestSender),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayCheckoutComPaymentStrategy, [
    { id: 'googlepaycheckoutcom' },
]);
