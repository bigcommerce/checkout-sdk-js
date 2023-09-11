import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeUPECustomerStrategy from './stripe-upe-customer-strategy';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const createStripeUPECustomerStrategy: PaymentStrategyFactory<any> = (
    paymentIntegrationService,
) => {
    return new StripeUPECustomerStrategy(
        paymentIntegrationService,
        new StripeUPEScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createStripeUPECustomerStrategy, [{ gateway: 'stripeupe' }]);
