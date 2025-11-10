import {
    isResolvableModule,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

export type StrategyFactory<TStrategy> = (
    paymentIntegrationService: PaymentIntegrationService,
) => TStrategy;

export function registerIntegrations<TStrategy, TResolveId extends { [key: string]: unknown }>(
    registry: ResolveIdRegistry<TStrategy, TResolveId>,
    integrations: Array<StrategyFactory<TStrategy>>,
    paymentIntegrationService: PaymentIntegrationService,
): void {
    integrations.forEach((factory) => {
        if (!isResolvableModule<StrategyFactory<TStrategy>, TResolveId>(factory)) {
            return;
        }

        factory.resolveIds.forEach((resolveId) => {
            if (registry.getFactory(resolveId)) {
                return;
            }

            registry.register(resolveId, () => factory(paymentIntegrationService));
        });
    });
}
