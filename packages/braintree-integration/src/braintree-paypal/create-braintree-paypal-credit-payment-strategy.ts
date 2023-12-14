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
import { Overlay } from '@bigcommerce/checkout-sdk/ui';

import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';

const createBraintreePaypalCreditPaymentStrategy: PaymentStrategyFactory<
    BraintreePaypalPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const overlay = new Overlay();

    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
        overlay,
    );

    return new BraintreePaypalPaymentStrategy(
        paymentIntegrationService,
        braintreeIntegrationService,
        true,
    );
};

export default toResolvableModule(createBraintreePaypalCreditPaymentStrategy, [
    { id: 'braintreepaypalcredit' },
]);
