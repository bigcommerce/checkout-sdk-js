import { createWalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import * as walletButtonStrategyFactories from '../generated/wallet-button-strategies';

import createWalletButtonStrategyRegistry from './create-wallet-button-strategy-registry';
import WalletButtonInitializer from './wallet-button-initializer';
import { WalletButtonInitializerOptions } from './wallet-buttons';

export default function createWalletButtonInitializer(
    options: WalletButtonInitializerOptions,
): WalletButtonInitializer {
    const { graphQLEndpoint } = options;

    const walletPaymentButtonIntegrationService =
        createWalletButtonIntegrationService(graphQLEndpoint);

    const registryV2 = createWalletButtonStrategyRegistry(
        walletPaymentButtonIntegrationService,
        walletButtonStrategyFactories,
    );

    return new WalletButtonInitializer(registryV2);
}
