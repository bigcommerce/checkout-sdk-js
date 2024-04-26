import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { AdyenV3ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayAdyenV3Gateway from '../../gateways/google-pay-adyenv3-gateway';
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
            new GooglePayAdyenV3Gateway(
                paymentIntegrationService,
                new AdyenV3ScriptLoader(getScriptLoader(), getStylesheetLoader()),
            ),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayAdyenV3CustomerStrategy, [
    { id: 'googlepayadyenv3' },
]);
