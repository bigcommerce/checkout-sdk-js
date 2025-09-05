import {
    isResolvableModule,
    PaymentIntegrationService,
    PaymentStrategy,
    PaymentStrategyFactory,
    PaymentStrategyResolveId,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

export interface PaymentStrategyFactories {
    [key: string]: PaymentStrategyFactory<PaymentStrategy>;
}

export default function createPaymentStrategyRegistry(
    paymentIntegrationService: PaymentIntegrationService,
    paymentStrategyFactories: PaymentStrategyFactories,
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
            // TODO: Remove toResolvableModule once CHECKOUT-9450.lazy_load_payment_strategies experiment is rolled out
            const factory = toResolvableModule(
                () => createPaymentStrategy(paymentIntegrationService),
                createPaymentStrategy.resolveIds,
            );

            registry.register(resolverId, factory);
        }
    }

    return registry;
}
