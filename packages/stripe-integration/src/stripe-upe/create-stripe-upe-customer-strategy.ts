import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeUPECustomerStrategy from './stripe-upe-customer-strategy';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const createStripeUPECustomerStrategy: CustomerStrategyFactory<StripeUPECustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new StripeUPECustomerStrategy(
        paymentIntegrationService,
        new StripeUPEScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createStripeUPECustomerStrategy, [{ id: 'stripeupe' }]);
