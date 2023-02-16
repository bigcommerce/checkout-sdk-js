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

import PayPalCommerceAlternativeMethodsButtonStrategy from './paypal-commerce-alternative-methods-button-strategy';

const createPayPalCommerceAlternativeMethodsButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceAlternativeMethodsButtonStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    const paypalCommerceIntegrationService = new PayPalCommerceIntegrationService(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );

    return new PayPalCommerceAlternativeMethodsButtonStrategy(
        paymentIntegrationService,
        paypalCommerceIntegrationService,
    );
};

export default toResolvableModule(createPayPalCommerceAlternativeMethodsButtonStrategy, [
    { id: 'paypalcommercealternativemethods' },
]);
