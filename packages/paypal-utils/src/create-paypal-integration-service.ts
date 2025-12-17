import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalSdkScriptLoader from './create-paypal-sdk-script-loader';
import PaypalIntegrationService from './paypal-integration-service';
import PaypalRequestSender from './paypal-request-sender';

const createPayPalIntegrationService = (paymentIntegrationService: PaymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PaypalIntegrationService(
        createFormPoster(),
        paymentIntegrationService,
        new PaypalRequestSender(createRequestSender({ host: getHost() })),
        createPayPalSdkScriptLoader(),
    );
};

export default createPayPalIntegrationService;
