import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';

export default function getPayPalCommerceIntegrationServiceMock(): PayPalCommerceIntegrationService {
    const formPoster = createFormPoster();
    const requestSender = createRequestSender();
    const paymentIntegrationService = new PaymentIntegrationServiceMock();
    const paypalCommerceRequestSender = new PayPalCommerceRequestSender(requestSender);
    const paypalCommerceScriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

    return new PayPalCommerceIntegrationService(
        formPoster,
        paymentIntegrationService,
        paypalCommerceRequestSender,
        paypalCommerceScriptLoader,
    );
}
