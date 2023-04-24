import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    PayPalCommerceIntegrationService,
    PayPalCommerceRequestSender,
    PayPalCommerceScriptLoader,
} from '../index';

import PayPalCommerceVenmoPaymentStrategy from './paypal-commerce-venmo-payment-strategy';

const createPayPalCommerceVenmoPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceVenmoPaymentStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    const paypalCommerceIntegrationService = new PayPalCommerceIntegrationService(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );

    return new PayPalCommerceVenmoPaymentStrategy(
        paymentIntegrationService,
        paypalCommerceIntegrationService,
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );
};

export default toResolvableModule(createPayPalCommerceVenmoPaymentStrategy, [
    { id: 'paypalcommercevenmo' },
]);
