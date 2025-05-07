import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import BigCommerceRequestSender from '../big-commerce-request-sender';
import BigCommerceScriptLoader from '../big-commerce-script-loader';

export default function getBigCommerceIntegrationServiceMock(): BigCommerceIntegrationService {
    const formPoster = createFormPoster();
    const requestSender = createRequestSender();
    const paymentIntegrationService = new PaymentIntegrationServiceMock();
    const bigCommerceRequestSender = new BigCommerceRequestSender(requestSender);
    const bigCommerceScriptLoader = new BigCommerceScriptLoader(getScriptLoader());

    return new BigCommerceIntegrationService(
        formPoster,
        paymentIntegrationService,
        bigCommerceRequestSender,
        bigCommerceScriptLoader,
    );
}
