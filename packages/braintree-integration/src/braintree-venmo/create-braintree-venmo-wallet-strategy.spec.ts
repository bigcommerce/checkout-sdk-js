import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreeVenmoWalletStrategy from './braintree-venmo-wallet-strategy';
import createBraintreeVenmoWalletStrategy from './create-braintree-venmo-wallet-strategy';

describe('createBraintreeVenmoWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('instantiates braintree venmo wallet strategy', () => {
        const strategy = createBraintreeVenmoWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeVenmoWalletStrategy);
    });
});
