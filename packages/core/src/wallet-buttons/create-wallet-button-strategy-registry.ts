import {
    CheckoutButtonStrategy,
    CheckoutButtonStrategyResolveId,
    isResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    WalletButtonIntegrationService,
    WalletButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import { ResolveIdRegistry } from '../common/registry';

export interface WalletButtonStrategyFactories {
    [key: string]: WalletButtonStrategyFactory<CheckoutButtonStrategy>;
}

export default function createWalletButtonStrategyRegistry(
    walletButtonIntegrationService: WalletButtonIntegrationService,
    walletButtonStrategyFactories: WalletButtonStrategyFactories,
): ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId> {
    const registry = new ResolveIdRegistry<
        CheckoutButtonStrategy,
        CheckoutButtonStrategyResolveId
    >();

    for (const [, createCheckoutButtonStrategy] of Object.entries(walletButtonStrategyFactories)) {
        if (
            !isResolvableModule<
                WalletButtonStrategyFactory<CheckoutButtonStrategy>,
                CheckoutButtonStrategyResolveId
            >(createCheckoutButtonStrategy)
        ) {
            continue;
        }

        for (const resolverId of createCheckoutButtonStrategy.resolveIds) {
            registry.register(resolverId, () =>
                createCheckoutButtonStrategy(walletButtonIntegrationService),
            );
        }
    }

    return registry;
}
