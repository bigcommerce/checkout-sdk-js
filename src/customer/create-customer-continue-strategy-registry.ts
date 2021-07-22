import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { BoltScriptLoader } from '../payment/strategies/bolt';

import { CustomerContinueStrategy } from './continue-strategies';
import { BoltCustomerContinueStrategy } from './continue-strategies/bolt';
import { DefaultCustomerContinueStrategy } from './continue-strategies/default';

export default function createCustomerContinueStrategyRegistry(
    store: CheckoutStore
): Registry<CustomerContinueStrategy> {
    const registry = new Registry<CustomerContinueStrategy>();
    const scriptLoader = getScriptLoader();

    registry.register('bolt', () =>
        new BoltCustomerContinueStrategy(
            store,
            new BoltScriptLoader(scriptLoader)
        )
    );

    registry.register('default', () =>
        new DefaultCustomerContinueStrategy(
            store
        )
    );

    return registry;
}
