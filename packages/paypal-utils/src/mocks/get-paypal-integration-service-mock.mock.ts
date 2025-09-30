import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import PayPalIntegrationService from '../paypal-integration-service';
import PayPalRequestSender from '../paypal-request-sender';
import PayPalSdkLoader from '../paypal-sdk-script-loader';

export default function getPayPalCommerceIntegrationServiceMock(): PayPalIntegrationService {
    const formPoster = createFormPoster();
    const requestSender = createRequestSender();
    const paymentIntegrationService = new PaymentIntegrationServiceMock();
    const paypalRequestSender = new PayPalRequestSender(requestSender);
    const paypalSdkLoader = new PayPalSdkLoader(getScriptLoader());

    return new PayPalIntegrationService(
        formPoster,
        paymentIntegrationService,
        paypalRequestSender,
        paypalSdkLoader,
    );
}
