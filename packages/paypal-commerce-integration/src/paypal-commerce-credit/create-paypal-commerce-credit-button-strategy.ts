import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalCommerceRequestSender, PayPalCommerceScriptLoader } from '../index';

import PayPalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

const createPayPalCommerceCreditButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceCreditButtonStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PayPalCommerceCreditButtonStrategy(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createPayPalCommerceCreditButtonStrategy, [
    { id: 'paypalcommercecredit' },
]);
