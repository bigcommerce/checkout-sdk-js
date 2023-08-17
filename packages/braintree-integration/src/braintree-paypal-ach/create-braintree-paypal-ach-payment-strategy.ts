import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeAchPaymentStrategy from './braintree-paypal-ach-payment-strategy';

const createBraintreePaypalAchPaymentStrategy: PaymentStrategyFactory<
    BraintreeAchPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreeAchPaymentStrategy(paymentIntegrationService, braintreeIntegrationService);
};

export default toResolvableModule(createBraintreePaypalAchPaymentStrategy, [
    { id: 'braintreeach' },
]);
