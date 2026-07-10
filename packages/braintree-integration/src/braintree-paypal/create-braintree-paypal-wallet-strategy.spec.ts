import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletStrategy from './braintree-paypal-wallet-strategy';
import createBraintreePaypalWalletStrategy from './create-braintree-paypal-wallet-strategy';

describe('createBraintreePaypalWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('instantiates braintree paypal wallet strategy', () => {
        const strategy = createBraintreePaypalWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalWalletStrategy);
    });
});
