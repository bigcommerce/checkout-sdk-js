import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalCommerceRequestSender, PayPalCommerceScriptLoader } from '../index';

import PayPalCommerceVenmoCustomerStrategy from './paypal-commerce-venmo-customer-strategy';

const createPayPalCommerceVenmoCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceVenmoCustomerStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PayPalCommerceVenmoCustomerStrategy(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createPayPalCommerceVenmoCustomerStrategy, [
    { id: 'paypalcommercevenmo' },
]);
