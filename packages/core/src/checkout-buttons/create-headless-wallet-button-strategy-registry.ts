import {
    DefaultHeadlessWalletButtonIntegrationService,
    HeadlessWalletButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/headless-wallet-button-integration';
import {
    CheckoutButtonStrategy,
    CheckoutButtonStrategyResolveId,
    isResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

export interface CheckoutHeadlessButtonStrategyFactories {
    [key: string]: HeadlessWalletButtonStrategyFactory<CheckoutButtonStrategy>;
}

export default function createHeadlessWalletButtonStrategyRegistry(
    headlessIntegrationService: DefaultHeadlessWalletButtonIntegrationService,
    checkoutHeadlessButtonStrategyFactories: CheckoutHeadlessButtonStrategyFactories,
): ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId> {
    const registry = new ResolveIdRegistry<
        CheckoutButtonStrategy,
        CheckoutButtonStrategyResolveId
    >();

    for (const [, createCheckoutButtonStrategy] of Object.entries(
        checkoutHeadlessButtonStrategyFactories,
    )) {
        if (
            !isResolvableModule<
                HeadlessWalletButtonStrategyFactory<CheckoutButtonStrategy>,
                CheckoutButtonStrategyResolveId
            >(createCheckoutButtonStrategy)
        ) {
            continue;
        }

        for (const resolverId of createCheckoutButtonStrategy.resolveIds) {
            registry.register(resolverId, () =>
                createCheckoutButtonStrategy(headlessIntegrationService),
            );
        }
    }

    return registry;
}
