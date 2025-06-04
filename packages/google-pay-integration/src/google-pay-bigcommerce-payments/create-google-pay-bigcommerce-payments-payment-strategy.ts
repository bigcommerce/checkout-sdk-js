import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PayPalSdkHelper } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../google-pay-payment-strategy';

import GooglePayBigCommercePaymentsGateway from './google-pay-bigcommerce-payments-gateway';
import GooglePayBigCommercePaymentsPaymentStrategy from './google-pay-bigcommerce-payments-payment-strategy';

const createGooglePayBigCommercePaymentsPaymentStrategy: PaymentStrategyFactory<
    GooglePayPaymentStrategy
> = (paymentIntegrationService) => {
    const payPalSdkHelper = new PayPalSdkHelper(getScriptLoader());

    return new GooglePayBigCommercePaymentsPaymentStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayBigCommercePaymentsGateway(paymentIntegrationService, payPalSdkHelper),
            createRequestSender(),
            createFormPoster(),
        ),
        payPalSdkHelper,
        createRequestSender(),
    );
};

export default toResolvableModule(createGooglePayBigCommercePaymentsPaymentStrategy, [
    { id: 'googlepay_bigcommerce_payments' },
]);
