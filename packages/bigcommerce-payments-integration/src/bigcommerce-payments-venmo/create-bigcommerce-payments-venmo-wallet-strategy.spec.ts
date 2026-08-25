import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsVenmoWalletStrategy from './bigcommerce-payments-venmo-wallet-strategy';
import createBigCommercePaymentsVenmoWalletStrategy from './create-bigcommerce-payments-venmo-wallet-strategy';

describe('createBigCommercePaymentsVenmoWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('instantiates BigCommercePaymentsVenmoWalletStrategy', () => {
        const strategy = createBigCommercePaymentsVenmoWalletStrategy(
            walletButtonIntegrationService,
        );

        expect(strategy).toBeInstanceOf(BigCommercePaymentsVenmoWalletStrategy);
    });
});
