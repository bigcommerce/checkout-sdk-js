import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsPayLaterWalletStrategy from './bigcommerce-payments-paylater-wallet-strategy';
import createBigCommercePaymentsPayLaterWalletStrategy from './create-bigcommerce-payments-paylater-wallet-strategy';

describe('createBigCommercePaymentsPayLaterWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('instantiates BigCommercePaymentsPayLaterWalletStrategy', () => {
        const strategy = createBigCommercePaymentsPayLaterWalletStrategy(
            walletButtonIntegrationService,
        );

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayLaterWalletStrategy);
    });
});
