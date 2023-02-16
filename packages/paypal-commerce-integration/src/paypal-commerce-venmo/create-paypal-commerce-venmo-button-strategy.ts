import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    PayPalCommerceIntegrationService,
    PayPalCommerceRequestSender,
    PayPalCommerceScriptLoader,
} from '../index';

import PayPalCommerceVenmoButtonStrategy from './paypal-commerce-venmo-button-strategy';

const createPayPalCommerceVenmoButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceVenmoButtonStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    const paypalCommerceIntegrationService = new PayPalCommerceIntegrationService(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );

    return new PayPalCommerceVenmoButtonStrategy(
        paymentIntegrationService,
        paypalCommerceIntegrationService,
    );
};

export default toResolvableModule(createPayPalCommerceVenmoButtonStrategy, [
    { id: 'paypalcommercevenmo' },
]);
