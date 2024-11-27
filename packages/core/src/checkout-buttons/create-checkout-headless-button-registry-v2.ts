import {
    CheckoutButtonStrategy,
    CheckoutButtonStrategyFactory,
    CheckoutButtonStrategyResolveId,
    isResolvableModule,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';
import * as defaultCheckoutHeadlessButtonStrategyFactories from '../generated/checkout-headless-button-strategies';

export interface CheckoutButtonStrategyFactories {
    [key: string]: CheckoutButtonStrategyFactory<CheckoutButtonStrategy>;
}

export default function createCheckoutHeadlessButtonStrategyRegistry(
    paymentIntegrationService: PaymentIntegrationService,
    checkoutButtonHeadlessStrategyFactories: CheckoutButtonStrategyFactories = defaultCheckoutHeadlessButtonStrategyFactories,
): ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId> {
    const registry = new ResolveIdRegistry<
        CheckoutButtonStrategy,
        CheckoutButtonStrategyResolveId
    >();

    for (const [, createCheckoutButtonStrategy] of Object.entries(
        checkoutButtonHeadlessStrategyFactories,
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
