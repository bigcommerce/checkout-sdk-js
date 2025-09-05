import { isEqual } from 'lodash';

import {
    isResolvableModule,
    PaymentIntegrationService,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';
import { SentryWindow } from '../common/types/sentry';

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

            // TODO: Remove toResolvableModule once CHECKOUT-9450.lazy_load_payment_strategies experiment is rolled out
            const createStrategy = toResolvableModule(
                () => factory(paymentIntegrationService),
                factory.resolveIds,
            );

            registry.register(resolveId, createStrategy);
        });
    });
}

// TODO: Remove this function once CHECKOUT-9450.lazy_load_payment_strategies experiment is rolled out
export function matchExistingIntegrations<TStrategy, TResolveId extends { [key: string]: unknown }>(
    registry: ResolveIdRegistry<TStrategy, TResolveId>,
    integrations: Array<StrategyFactory<TStrategy>>,
    resolveId: TResolveId,
): boolean {
    const existingFactory = registry.getFactory(resolveId);
    const matchedExisting = integrations.some(
        (factory) =>
            isResolvableModule(existingFactory) &&
            isResolvableModule(factory) &&
            isEqual(existingFactory.resolveIds, factory.resolveIds),
    );

    // During the initial rollout, all strategies will continue to be registered with `strategyRegistryV2`
    // and bundled together by default. This allows us to compare the passed-in strategies with the existing
    // ones to ensure they match. Once confirmed, we can remove the comparison logic and the existing strategies,
    // relying solely on the passed-in strategies.
    if (existingFactory && !matchedExisting) {
        const message = `A different strategy is registered for ${JSON.stringify(resolveId)}.`;
        const { Sentry } = window as SentryWindow;

        if (Sentry?.captureMessage) {
            Sentry.captureMessage(message);
        } else {
            // eslint-disable-next-line no-console
            console.log(message);
        }
    }

    return matchedExisting;
}
