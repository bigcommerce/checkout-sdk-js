import {
    CheckoutButtonStrategy,
    CheckoutButtonStrategyResolveId,
    isResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    WalletButtonIntegrationService,
    WalletPaymentButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import { ResolveIdRegistry } from '../common/registry';

export interface WalletButtonStrategyFactories {
    [key: string]: WalletPaymentButtonStrategyFactory<CheckoutButtonStrategy>;
}

export default function createWalletButtonStrategyRegistry(
    walletButtonIntegrationService: WalletButtonIntegrationService,
    walletButtonStrategyFactories: WalletButtonStrategyFactories,
): ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId> {
    const registry = new ResolveIdRegistry<
        CheckoutButtonStrategy,
        CheckoutButtonStrategyResolveId
    >();

    for (const [, createWalletButtonStrategy] of Object.entries(walletButtonStrategyFactories)) {
        if (
            !isResolvableModule<
                WalletPaymentButtonStrategyFactory<CheckoutButtonStrategy>,
                CheckoutButtonStrategyResolveId
            >(createWalletButtonStrategy)
        ) {
            continue;
        }

        for (const resolverId of createWalletButtonStrategy.resolveIds) {
            registry.register(resolverId, () =>
                createWalletButtonStrategy(walletButtonIntegrationService),
            );
        }
    }

    return registry;
}
