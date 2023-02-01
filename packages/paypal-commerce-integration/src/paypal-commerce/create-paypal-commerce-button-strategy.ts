import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalCommerceRequestSender, PayPalCommerceScriptLoader } from '../index';

import PayPalCommerceButtonStrategy from './paypal-commerce-button-strategy';

const createPayPalCommerceButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceButtonStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PayPalCommerceButtonStrategy(
        createFormPoster(),
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        new PayPalCommerceScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createPayPalCommerceButtonStrategy, [{ id: 'paypalcommerce' }]);
