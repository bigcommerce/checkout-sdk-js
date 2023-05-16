import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceButtonStrategy from './paypal-commerce-button-strategy';

const createPayPalCommerceButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceButtonStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceButtonStrategy, [{ id: 'paypalcommerce' }]);
