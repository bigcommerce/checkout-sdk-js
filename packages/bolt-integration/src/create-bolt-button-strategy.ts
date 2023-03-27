import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BoltButtonStrategy from './bolt-button-strategy';
import BoltScriptLoader from './bolt-script-loader';

const createBoltButtonStrategy: CheckoutButtonStrategyFactory<BoltButtonStrategy> = (
    paymentIntegrationService,
) => {
    return new BoltButtonStrategy(
        paymentIntegrationService,
        new BoltScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createBoltButtonStrategy, [{ id: 'bolt' }]);
