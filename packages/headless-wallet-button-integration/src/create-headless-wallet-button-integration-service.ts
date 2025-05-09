import { createRequestSender } from '@bigcommerce/request-sender';

import DefaultHeadlessWalletButtonIntegrationService from './default-headless-wallet-button-integration-service';
import HeadlessWalletButtonIntegrationRequestService from './headless-wallet-button-integration-request-service';

const createHeadlessWalletButtonIntegrationService = () => {
    const headlessWalletButtonIntegrationRequestService =
        new HeadlessWalletButtonIntegrationRequestService(createRequestSender());

    return new DefaultHeadlessWalletButtonIntegrationService(
        headlessWalletButtonIntegrationRequestService,
    );
};

export default createHeadlessWalletButtonIntegrationService;
