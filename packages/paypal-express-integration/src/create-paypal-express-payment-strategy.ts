import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PaypalExpressPaymentStrategy from './paypal-express-payment-strategy';
import PaypalExpressScriptLoader from './paypal-express-script-loader';

const createPaypalExpressPaymentStrategy: PaymentStrategyFactory<PaypalExpressPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new PaypalExpressPaymentStrategy(
        paymentIntegrationService,
        new PaypalExpressScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createPaypalExpressPaymentStrategy, [
    { id: 'paypalexpress', type: 'PAYMENT_TYPE_HOSTED' },
    { id: 'paypalexpresscredit', type: 'PAYMENT_TYPE_HOSTED' },
]);
