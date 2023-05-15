import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeHostWindow } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';

import BraintreePaypalCustomerStrategy from './braintree-paypal-customer-strategy';

const createBraintreePaypalCustomerStrategy: CustomerStrategyFactory<
    BraintreePaypalCustomerStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );
console.log('sdsd');
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
