import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalCommerceRequestSender, PayPalCommerceScriptLoader } from '../index';

import PayPalCommerceInlineButtonStrategy from './paypal-commerce-inline-button-strategy';

const createPayPalCommerceInlineButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceInlineButtonStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PayPalCommerceInlineButtonStrategy(
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createPayPalCommerceInlineButtonStrategy, [
    { id: 'paypalcommerceinline' },
]);
