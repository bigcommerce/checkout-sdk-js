import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BigCommercePaymentsIntegrationService,
    BigCommercePaymentsRequestSender,
    BigCommercePaymentsScriptLoader,
} from './index';

const createBigCommercePaymentsIntegrationService = (
    paymentIntegrationService: PaymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();

    return new BigCommercePaymentsIntegrationService(
        createFormPoster(),
        paymentIntegrationService,
        new BigCommercePaymentsRequestSender(createRequestSender({ host: getHost() })),
        new BigCommercePaymentsScriptLoader(getScriptLoader()),
    );
};

export default createBigCommercePaymentsIntegrationService;
