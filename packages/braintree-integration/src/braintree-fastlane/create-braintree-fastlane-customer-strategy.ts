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
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import BraintreeFastlaneCustomerStrategy from './braintree-fastlane-customer-strategy';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

const createBraintreeFastlaneCustomerStrategy: CustomerStrategyFactory<
    BraintreeFastlaneCustomerStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );
    const browserStorage = new BrowserStorage('paypalConnect');
    const braintreeFastlaneUtils = new BraintreeFastlaneUtils(
        paymentIntegrationService,
        braintreeIntegrationService,
        browserStorage,
    );

    return new BraintreeFastlaneCustomerStrategy(
        paymentIntegrationService,
        braintreeFastlaneUtils,
    );
};

// Info: braintree method id was added only for A/B testing purposes.
// The main reason why we can't go in other way, because braintreefastlane
// may be turned on only when BE knows customer's email address (to understand should we show the feature for the user or not).
// So { id: 'braintree' }, should be removed after A/B testing
export default toResolvableModule(createBraintreeFastlaneCustomerStrategy, [
    { id: 'braintreefastlane' },
    { id: 'braintree' },
]);
