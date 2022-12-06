import {
    isResolvableModule,
    PaymentIntegrationService,
    PaymentStrategy,
    PaymentStrategyFactory,
    PaymentStrategyResolveId,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';
import * as defaultCustomerStrategyFactories from '../generated/payment-strategies';

export interface PaymentStrategyFactories {
    [key: string]: PaymentStrategyFactory<PaymentStrategy>;
}

export default function createPaymentStrategyRegistry(
    paymentIntegrationService: PaymentIntegrationService,
    paymentStrategyFactories: PaymentStrategyFactories = defaultCustomerStrategyFactories,
): ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId> {
    const registry = new ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId>();

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
