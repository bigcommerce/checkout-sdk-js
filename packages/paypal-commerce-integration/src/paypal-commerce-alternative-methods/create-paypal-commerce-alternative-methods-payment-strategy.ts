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

import PayPalCommerceAlternativeMethodsPaymentStrategy from './paypal-commerce-alternative-methods-payment-strategy';

const createPayPalCommerceAlternativeMethodsPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceAlternativeMethodsPaymentStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    const paypalCommerceIntegrationService = new PayPalCommerceIntegrationService(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );

    return new PayPalCommerceAlternativeMethodsPaymentStrategy(
        paymentIntegrationService,
        paypalCommerceIntegrationService,
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );
};

export default toResolvableModule(createPayPalCommerceAlternativeMethodsPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods' },
]);
