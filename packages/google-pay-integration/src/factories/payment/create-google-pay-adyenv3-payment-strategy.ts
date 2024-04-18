import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { AdyenV3ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayAdyenV3Gateway from '../../gateways/google-pay-adyenv3-gateway';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayAdyenV3PaymentStrategy: PaymentStrategyFactory<GooglePayPaymentStrategy> = (
    paymentIntegrationService,
) =>
    new GooglePayPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayAdyenV3Gateway(
                paymentIntegrationService,
                new AdyenV3ScriptLoader(getScriptLoader(), getStylesheetLoader()),
            ),
            createRequestSender(),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayAdyenV3PaymentStrategy, [
    { id: 'googlepayadyenv3' },
]);
