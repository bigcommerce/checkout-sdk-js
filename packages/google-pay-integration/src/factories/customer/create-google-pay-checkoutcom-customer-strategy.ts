import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayCheckoutComGateway from '../../gateways/google-pay-checkoutcom-gateway';
import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayCheckoutComCustomerStrategy: CustomerStrategyFactory<
    GooglePayCustomerStrategy
> = (paymentIntegrationService) => {
    const useRegistryV1 = !paymentIntegrationService.getState().getStoreConfig()?.checkoutSettings
        .features['INT-5659.checkoutcom_use_new_googlepay_customer_strategy'];

    if (useRegistryV1) {
        throw new Error('googlepaycheckoutcom requires using registryV1');
    }

    const requestSender = createRequestSender();

    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayCheckoutComGateway(paymentIntegrationService, requestSender),
            requestSender,
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayCheckoutComCustomerStrategy, [
    { id: 'googlepaycheckoutcom' },
]);
