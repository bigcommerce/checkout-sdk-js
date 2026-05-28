export default class WalletButtonIntegrationService {
    constructor(private graphQLEndpoint: string) {}

    getGraphQLEndpoint(): string {
        return this.graphQLEndpoint;
    }
}
