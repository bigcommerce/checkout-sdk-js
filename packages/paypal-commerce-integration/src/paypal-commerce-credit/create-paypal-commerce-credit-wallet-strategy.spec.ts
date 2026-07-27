import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import createPayPalCommerceCreditWalletStrategy from './create-paypal-commerce-credit-wallet-strategy';
import PayPalCommerceCreditWalletStrategy from './paypal-commerce-credit-wallet-strategy';

describe('createPayPalCommerceCreditWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('creates an instance of PayPalCommerceCreditWalletStrategy', () => {
        const strategy = createPayPalCommerceCreditWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceCreditWalletStrategy);
    });
});
