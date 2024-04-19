import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BoltCustomerStrategy from './bolt-customer-strategy';
import BoltScriptLoader from './bolt-script-loader';

const createBoltCustomerStrategy: CustomerStrategyFactory<BoltCustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new BoltCustomerStrategy(
        paymentIntegrationService,
        new BoltScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createBoltCustomerStrategy, [{ id: 'bolt' }]);
