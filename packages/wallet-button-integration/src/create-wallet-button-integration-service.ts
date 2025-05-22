import { createRequestSender } from '@bigcommerce/request-sender';

import BillingAddressRequestSender from './billing/billing-address-request-sender';
import { PaymentRequestSender } from './payment/payment-request-sender';
import WalletButtonIntegrationService from './wallet-button-integration-service';

const createWalletButtonIntegrationService = (graphQLEndpoint: string) => {
    const requestSender = createRequestSender();

    return new WalletButtonIntegrationService(
        graphQLEndpoint,
        new BillingAddressRequestSender(requestSender),
        new PaymentRequestSender(requestSender),
    );
};

export default createWalletButtonIntegrationService;
