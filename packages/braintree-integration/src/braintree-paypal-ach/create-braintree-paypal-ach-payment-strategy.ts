import { getScriptLoader } from '@bigcommerce/script-loader';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeHostWindow } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import BraintreeAchPaymentStrategy from './braintree-paypal-ach-payment-strategy';

const createBraintreePaypalAchPaymentStrategy: CheckoutButtonStrategyFactory<
    BraintreeAchPaymentStrategy
> = (paymentIntegrationService) => {

    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreeAchPaymentStrategy(
        paymentIntegrationService,
        braintreeIntegrationService
    );
};

export default toResolvableModule(createBraintreePaypalAchPaymentStrategy, [{ id: 'braintreeach' }]);
