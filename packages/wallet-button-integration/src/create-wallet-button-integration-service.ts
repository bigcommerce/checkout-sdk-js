import WalletButtonIntegrationService from './wallet-button-integration-service';

const createWalletButtonIntegrationService = (
    graphQLEndpoint: string,
): WalletButtonIntegrationService => {
    return new WalletButtonIntegrationService(graphQLEndpoint);
};

export default createWalletButtonIntegrationService;
