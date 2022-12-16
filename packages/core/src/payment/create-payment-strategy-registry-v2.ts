import {
    isResolvableModule,
    PaymentIntegrationService,
    PaymentStrategy,
    PaymentStrategyFactory,
    PaymentStrategyResolveId,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';
import * as defaultPaymentStrategyFactories from '../generated/payment-strategies';

export interface PaymentStrategyFactories {
    [key: string]: PaymentStrategyFactory<PaymentStrategy>;
}

export default function createPaymentStrategyRegistry(
    paymentIntegrationService: PaymentIntegrationService,
    paymentStrategyFactories: PaymentStrategyFactories = defaultPaymentStrategyFactories,
    options: { useFallback: boolean } = { useFallback: false },
): ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId> {
    const { useFallback } = options;
    const registry = new ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId>(useFallback);

    for (const [, createPaymentStrategy] of Object.entries(paymentStrategyFactories)) {
        if (
            !isResolvableModule<PaymentStrategyFactory<PaymentStrategy>, PaymentStrategyResolveId>(
                createPaymentStrategy,
            )
        ) {
            continue;
        }

        for (const resolverId of createPaymentStrategy.resolveIds) {
            registry.register(resolverId, () => createPaymentStrategy(paymentIntegrationService));
        }
    }

    return registry;
}
