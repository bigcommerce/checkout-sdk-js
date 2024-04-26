import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { AdyenV2ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayAdyenV2Gateway from '../../gateways/google-pay-adyenv2-gateway';
import GooglePayButtonStrategy from '../../google-pay-button-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayAdyenV2ButtonStrategy: CheckoutButtonStrategyFactory<
    GooglePayButtonStrategy
> = (paymentIntegrationService) => {
    const requestSender = createRequestSender();

    return new GooglePayButtonStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayAdyenV2Gateway(
                paymentIntegrationService,
                new AdyenV2ScriptLoader(getScriptLoader(), getStylesheetLoader()),
            ),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayAdyenV2ButtonStrategy, [
    { id: 'googlepayadyenv2' },
]);
