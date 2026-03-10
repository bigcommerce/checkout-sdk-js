import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalIntegrationService } from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceButtonStrategy from './paypal-commerce-button-strategy';

const createPayPalCommerceButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceButtonStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceButtonStrategy, [{ id: 'paypalcommerce' }]);
