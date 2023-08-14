import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { BraintreeHostWindow } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';

import BraintreeAcceleratedCheckoutCustomerStrategy from './braintree-accelerated-checkout-customer-strategy';
import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

const createBraintreeAcceleratedCheckoutCustomerStrategy: CustomerStrategyFactory<
    BraintreeAcceleratedCheckoutCustomerStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );
    const browserStorage = new BrowserStorage('paypal-connect');
    const braintreeAcceleratedCheckoutUtils = new BraintreeAcceleratedCheckoutUtils(
        paymentIntegrationService,
        braintreeIntegrationService,
        browserStorage,
    );

    return new BraintreeAcceleratedCheckoutCustomerStrategy(
        paymentIntegrationService,
        braintreeAcceleratedCheckoutUtils,
    );
};

// Info: braintree method id was added only for A/B testing purposes.
// The main reason why we can't go in other way, because braintreeacceleratedcheckout
// may be turned on only when BE knows customer's email address (to understand should we show the feature for the user or not).
// So { id: 'braintree' }, should be removed after A/B testing
export default toResolvableModule(createBraintreeAcceleratedCheckoutCustomerStrategy, [
    { id: 'braintreeacceleratedcheckout' },
    { id: 'braintree' },
]);
