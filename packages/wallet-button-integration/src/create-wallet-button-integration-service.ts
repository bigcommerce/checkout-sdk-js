import { createRequestSender } from '@bigcommerce/request-sender';

import { PaymentRequestSender } from './payment/payment-request-sender';
import WalletButtonIntegrationService from './wallet-button-integration-service';

const createWalletButtonIntegrationService = (
    graphQLEndpoint: string,
): WalletButtonIntegrationService => {
    const requestSender = createRequestSender();

    return new WalletButtonIntegrationService(
        graphQLEndpoint,
        new PaymentRequestSender(requestSender),
    );
};

export default createWalletButtonIntegrationService;
