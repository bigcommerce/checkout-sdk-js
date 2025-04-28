import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BigCommerceIntegrationService,
    BigCommerceRequestSender,
    BigCommerceScriptLoader,
} from './index';

const createBigCommerceIntegrationService = (
    paymentIntegrationService: PaymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();

    return new BigCommerceIntegrationService(
        createFormPoster(),
        paymentIntegrationService,
        new BigCommerceRequestSender(createRequestSender({ host: getHost() })),
        new BigCommerceScriptLoader(getScriptLoader()),
    );
};

export default createBigCommerceIntegrationService;
