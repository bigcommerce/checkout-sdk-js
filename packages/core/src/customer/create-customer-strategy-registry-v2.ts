import {
    CustomerStrategy,
    CustomerStrategyFactory,
    CustomerStrategyResolveId,
    isResolvableModule,
    PaymentIntegrationService,
    toResolvableModule,
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
            // TODO: Remove toResolvableModule once CHECKOUT-9450.lazy_load_payment_strategies experiment is rolled out
            const factory = toResolvableModule(
                () => createCustomerStrategy(paymentIntegrationService),
                createCustomerStrategy.resolveIds,
            );

            registry.register(resolverId, factory);
        }
    }

    return registry;
}
