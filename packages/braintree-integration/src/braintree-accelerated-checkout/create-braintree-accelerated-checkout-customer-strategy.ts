import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeHostWindow } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';

import BraintreeAcceleratedCheckoutCustomerStrategy from './braintree-accelerated-checkout-customer-strategy';

const createBraintreeAcceleratedCheckoutCustomerStrategy: CustomerStrategyFactory<
    BraintreeAcceleratedCheckoutCustomerStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreeAcceleratedCheckoutCustomerStrategy(
        paymentIntegrationService,
        braintreeIntegrationService,
    );
};

export default toResolvableModule(createBraintreeAcceleratedCheckoutCustomerStrategy, [
    { id: 'braintreeacceleratedcheckout' },
]);
