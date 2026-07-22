import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalCreditWalletStrategy from './braintree-paypal-credit-wallet-strategy';
import createBraintreePaypalCreditWalletStrategy from './create-braintree-paypal-credit-wallet-strategy';

describe('createBraintreePaypalCreditWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('instantiates braintree paypal credit wallet strategy', () => {
        const strategy = createBraintreePaypalCreditWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalCreditWalletStrategy);
    });
});
