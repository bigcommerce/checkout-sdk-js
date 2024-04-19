import {
    CustomerStrategy,
    CustomerStrategyFactory,
    CustomerStrategyResolveId,
    isResolvableModule,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';
import * as defaultCustomerStrategyFactories from '../generated/customer-strategies';

export interface CustomerStrategyFactories {
    [key: string]: CustomerStrategyFactory<CustomerStrategy>;
}

export default function createCustomerStrategyRegistry(
    paymentIntegrationService: PaymentIntegrationService,
    customerStrategyFactories: CustomerStrategyFactories = defaultCustomerStrategyFactories,
): ResolveIdRegistry<CustomerStrategy, CustomerStrategyResolveId> {
    const registry = new ResolveIdRegistry<CustomerStrategy, CustomerStrategyResolveId>();

    for (const [, createCustomerStrategy] of Object.entries(customerStrategyFactories)) {
        if (
            !isResolvableModule<
                CustomerStrategyFactory<CustomerStrategy>,
                CustomerStrategyResolveId
            >(createCustomerStrategy)
        ) {
            continue;
        }

        for (const resolverId of createCustomerStrategy.resolveIds) {
            registry.register(resolverId, () => createCustomerStrategy(paymentIntegrationService));
        }
    }

    return registry;
}
