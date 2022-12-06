import {
    CheckoutButtonStrategy,
    CheckoutButtonStrategyFactory,
    CheckoutButtonStrategyResolveId,
    isResolvableModule,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';
import * as defaultCheckoutButtonStrategyFactories from '../generated/checkout-button-strategies';

export interface CheckoutButtonStrategyFactories {
    [key: string]: CheckoutButtonStrategyFactory<CheckoutButtonStrategy>;
}

export default function createCheckoutButtonStrategyRegistry(
    paymentIntegrationService: PaymentIntegrationService,
    checkoutButtonStrategyFactories: CheckoutButtonStrategyFactories = defaultCheckoutButtonStrategyFactories,
): ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId> {
    const registry = new ResolveIdRegistry<
        CheckoutButtonStrategy,
        CheckoutButtonStrategyResolveId
    >();

    for (const [, createCheckoutButtonStrategy] of Object.entries(
        checkoutButtonStrategyFactories,
    )) {
        if (
            !isResolvableModule<
                CheckoutButtonStrategyFactory<CheckoutButtonStrategy>,
                CheckoutButtonStrategyResolveId
            >(createCheckoutButtonStrategy)
        ) {
            continue;
        }

        for (const resolverId of createCheckoutButtonStrategy.resolveIds) {
            registry.register(resolverId, () =>
                createCheckoutButtonStrategy(paymentIntegrationService),
            );
        }
    }

    return registry;
}
