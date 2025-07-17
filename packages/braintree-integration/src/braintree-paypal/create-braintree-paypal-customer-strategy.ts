import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreePaypalCustomerStrategy from './braintree-paypal-customer-strategy';

const createBraintreePaypalCustomerStrategy: CustomerStrategyFactory<
    BraintreePaypalCustomerStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(
            getScriptLoader(),
            braintreeHostWindow,
            braintreeSDKVersionManager,
        ),
        braintreeHostWindow,
    );

    return new BraintreePaypalCustomerStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeIntegrationService,
        braintreeHostWindow,
    );
};

export default toResolvableModule(createBraintreePaypalCustomerStrategy, [
    { id: 'braintreepaypal' },
]);
