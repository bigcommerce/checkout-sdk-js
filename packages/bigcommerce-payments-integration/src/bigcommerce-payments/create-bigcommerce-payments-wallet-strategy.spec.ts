import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsWalletStrategy from './bigcommerce-payments-wallet-strategy';
import createBigCommercePaymentsWalletStrategy from './create-bigcommerce-payments-wallet-strategy';

describe('createBigCommercePaymentsWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('instantiates BigCommercePaymentsWalletStrategy', () => {
        const strategy = createBigCommercePaymentsWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsWalletStrategy);
    });
});
