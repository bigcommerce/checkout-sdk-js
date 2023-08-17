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

import BraintreeAcceleratedCheckoutPaymentStrategy from './braintree-accelerated-checkout-payment-strategy';
import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

const createBraintreeAcceleratedCheckoutPaymentStrategy: PaymentStrategyFactory<
    BraintreeAcceleratedCheckoutPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    const braintreeAcceleratedCheckoutUtils = new BraintreeAcceleratedCheckoutUtils(
        paymentIntegrationService,
        braintreeIntegrationService,
    );

    return new BraintreeAcceleratedCheckoutPaymentStrategy(
        paymentIntegrationService,
        braintreeAcceleratedCheckoutUtils,
    );
};

export default toResolvableModule(createBraintreeAcceleratedCheckoutPaymentStrategy, [
    { id: 'braintreeacceleratedcheckout' },
]);
