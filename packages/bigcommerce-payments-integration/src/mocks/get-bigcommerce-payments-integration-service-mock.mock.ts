import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import BigCommercePaymentsRequestSender from '../bigcommerce-payments-request-sender';
import BigCommercePaymentsScriptLoader from '../bigcommerce-payments-script-loader';

export default function getBigCommercePaymentsIntegrationServiceMock(): BigCommercePaymentsIntegrationService {
    const formPoster = createFormPoster();
    const requestSender = createRequestSender();
    const paymentIntegrationService = new PaymentIntegrationServiceMock();
    const getBigCommercePaymentsRequestSender = new BigCommercePaymentsRequestSender(requestSender);
    const getBigCommercePaymentsScriptLoader = new BigCommercePaymentsScriptLoader(
        getScriptLoader(),
    );

    return new BigCommercePaymentsIntegrationService(
        formPoster,
        paymentIntegrationService,
        getBigCommercePaymentsRequestSender,
        getBigCommercePaymentsScriptLoader,
    );
}
