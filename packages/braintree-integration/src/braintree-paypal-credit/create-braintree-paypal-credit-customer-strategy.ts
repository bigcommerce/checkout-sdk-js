import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreePaypalCreditCustomerStrategy from './braintree-paypal-credit-customer-strategy';

const createBraintreePaypalCreditCustomerStrategy: CustomerStrategyFactory<
    BraintreePaypalCreditCustomerStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreePaypalCreditCustomerStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeIntegrationService,
        braintreeHostWindow,
    );
};

export default toResolvableModule(createBraintreePaypalCreditCustomerStrategy, [
    { id: 'braintreepaypalcredit' },
]);
