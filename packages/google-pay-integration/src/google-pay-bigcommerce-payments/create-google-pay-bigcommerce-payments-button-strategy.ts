import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PayPalSdkHelper } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayButtonStrategy from '../google-pay-button-strategy';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';

import GooglePayBigCommercePaymentsGateway from './google-pay-bigcommerce-payments-gateway';

const createGooglePayBigCommercePaymentsButtonStrategy: CheckoutButtonStrategyFactory<
    GooglePayButtonStrategy
> = (paymentIntegrationService) => {
    return new GooglePayButtonStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayBigCommercePaymentsGateway(
                paymentIntegrationService,
                new PayPalSdkHelper(getScriptLoader()),
            ),
            createRequestSender(),
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayBigCommercePaymentsButtonStrategy, [
    { id: 'googlepay_bigcommerce_payments' },
]);
