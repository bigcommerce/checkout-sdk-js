import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PayPalSdkHelper } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayCustomerStrategy from '../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';

import GooglePayBigCommercePaymentsGateway from './google-pay-bigcommerce-payments-gateway';

const createGooglePayBigCommercePaymentsCustomerStrategy: CustomerStrategyFactory<
    GooglePayCustomerStrategy
> = (paymentIntegrationService) => {
    return new GooglePayCustomerStrategy(
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

export default toResolvableModule(createGooglePayBigCommercePaymentsCustomerStrategy, [
    { id: 'googlepay_bigcommerce_payments' },
]);
