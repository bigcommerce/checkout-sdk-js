import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayStripeGateway from '../../gateways/google-pay-stripe-gateway';
import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';
import GooglePayPaymentProcessor from '../../google-pay-payment-processor';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayStripeUpeCustomerStrategy: CustomerStrategyFactory<
    GooglePayCustomerStrategy
> = (paymentIntegrationService) => {
    const useRegistryV1 = !paymentIntegrationService.getState().getStoreConfig()?.checkoutSettings
        .features['INT-5659.stripeupe_use_new_googlepay_customer_strategy'];

    if (useRegistryV1) {
        throw new Error('googlepaystripeupe requires using registryV1');
    }

    return new GooglePayCustomerStrategy(
        paymentIntegrationService,
        new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayStripeGateway(paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayStripeUpeCustomerStrategy, [
    { id: 'googlepaystripeupe' },
]);
