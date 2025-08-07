import {
    CustomerStrategy,
    CustomerStrategyFactory,
    CustomerStrategyResolveId,
    isResolvableModule,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

export interface CustomerStrategyFactories {
    [key: string]: CustomerStrategyFactory<CustomerStrategy>;
}

export default function createCustomerStrategyRegistry(
    paymentIntegrationService: PaymentIntegrationService,
    customerStrategyFactories: CustomerStrategyFactories,
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
