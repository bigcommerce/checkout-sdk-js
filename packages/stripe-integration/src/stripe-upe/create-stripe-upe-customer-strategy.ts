import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeScriptLoader } from '../stripe-utils';

import StripeUPECustomerStrategy from './stripe-upe-customer-strategy';

const createStripeUPECustomerStrategy: CustomerStrategyFactory<StripeUPECustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new StripeUPECustomerStrategy(
        paymentIntegrationService,
        new StripeScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createStripeUPECustomerStrategy, [{ id: 'stripeupe' }]);
