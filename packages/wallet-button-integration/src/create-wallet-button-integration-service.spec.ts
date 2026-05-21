import createWalletButtonIntegrationService from './create-wallet-button-integration-service';
import WalletButtonIntegrationService from './wallet-button-integration-service';

describe('createWalletButtonIntegrationService', () => {
    it('creates a WalletButtonIntegrationService instance', () => {
        const service = createWalletButtonIntegrationService('graphql');

        expect(service).toBeInstanceOf(WalletButtonIntegrationService);
    });
});
