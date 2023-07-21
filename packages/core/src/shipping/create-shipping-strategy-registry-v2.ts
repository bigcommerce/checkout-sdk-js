import {
    isResolvableModule,
    PaymentIntegrationService,
    ShippingStrategy,
    ShippingStrategyFactory,
    ShippingStrategyResolveId,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';
import * as defaultShippingStrategyFactories from '../generated/shipping-strategies';

export interface ShippingStrategyFactories {
    [key: string]: ShippingStrategyFactory<ShippingStrategy>;
}

export default function createShippingStrategyRegistryV2(
    paymentIntegrationService: PaymentIntegrationService,
    shippingStrategyFactories: ShippingStrategyFactories = defaultShippingStrategyFactories,
    options: { useFallback: boolean } = { useFallback: false },
): ResolveIdRegistry<ShippingStrategy, ShippingStrategyResolveId> {
    const { useFallback } = options;
    const registry = new ResolveIdRegistry<ShippingStrategy, ShippingStrategyResolveId>(
        useFallback,
    );

    for (const [, createShippingStrategy] of Object.entries(shippingStrategyFactories)) {
        if (
            !isResolvableModule<
                ShippingStrategyFactory<ShippingStrategy>,
                ShippingStrategyResolveId
            >(createShippingStrategy)
        ) {
            continue;
        }

        for (const resolverId of createShippingStrategy.resolveIds) {
            registry.register(resolverId, () => createShippingStrategy(paymentIntegrationService));
        }
    }

    return registry;
}
