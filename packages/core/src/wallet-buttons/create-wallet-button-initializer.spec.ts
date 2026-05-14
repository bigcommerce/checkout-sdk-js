import { createWalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import createWalletButtonInitializer from './create-wallet-button-initializer';
import WalletButtonInitializer from './wallet-button-initializer';

jest.mock('@bigcommerce/checkout-sdk/wallet-button-integration');
jest.mock('../generated/wallet-button-strategies', () => ({}));

describe('createWalletButtonInitializer', () => {
    beforeEach(() => {
        (createWalletButtonIntegrationService as jest.Mock).mockReturnValue({
            getGraphQLEndpoint: () => '/graphql',
        });
    });

    it('creates a WalletButtonInitializer instance', () => {
        const initializer = createWalletButtonInitializer({
            graphQLEndpoint: '/graphql',
        });

        expect(initializer).toBeInstanceOf(WalletButtonInitializer);
    });
});
