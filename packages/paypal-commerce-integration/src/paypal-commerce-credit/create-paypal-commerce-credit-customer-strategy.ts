import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalCommerceRequestSender, PayPalCommerceScriptLoader } from '../index';

import PayPalCommerceCreditCustomerStrategy from './paypal-commerce-credit-customer-strategy';

const createPayPalCommerceCreditCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceCreditCustomerStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PayPalCommerceCreditCustomerStrategy(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createPayPalCommerceCreditCustomerStrategy, [
    { id: 'paypalcommercecredit' },
]);
