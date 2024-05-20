import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CardinalClient,
    CardinalScriptLoader,
    CardinalThreeDSecureFlow,
} from '@bigcommerce/checkout-sdk/cardinal-integration';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';

const createPayPalProPaymentStrategy: CheckoutButtonStrategyFactory<PaypalProPaymentStrategy> = (
    paymentIntegrationService,
) =>
    new PaypalProPaymentStrategy(
        paymentIntegrationService,
        new CardinalThreeDSecureFlow(
            paymentIntegrationService,
            new CardinalClient(new CardinalScriptLoader(getScriptLoader())),
        ),
    );

export default toResolvableModule(createPayPalProPaymentStrategy, [{ id: 'paypal' }]);
