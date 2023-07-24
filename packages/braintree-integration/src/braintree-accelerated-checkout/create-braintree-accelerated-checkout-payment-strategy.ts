import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeHostWindow } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';

import BraintreeAcceleratedCheckoutPaymentStrategy from './braintree-accelerated-checkout-payment-strategy';

const createBraintreeAcceleratedCheckoutPaymentStrategy: PaymentStrategyFactory<
    BraintreeAcceleratedCheckoutPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreeAcceleratedCheckoutPaymentStrategy(
        paymentIntegrationService,
        braintreeIntegrationService,
    );
};

export default toResolvableModule(createBraintreeAcceleratedCheckoutPaymentStrategy, [
    { id: 'braintreeacceleratedcheckout' },
]);
