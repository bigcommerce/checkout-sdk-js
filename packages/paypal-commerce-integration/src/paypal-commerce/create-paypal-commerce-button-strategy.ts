import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    PaypalButtonCreationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceButtonStrategy from './paypal-commerce-button-strategy';

const createPayPalCommerceButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceButtonStrategy
> = (paymentIntegrationService) => {
    const paypalIntegrationService = createPayPalIntegrationService(paymentIntegrationService);
    const paypalButtonCreationService = new PaypalButtonCreationService(
        paymentIntegrationService,
        paypalIntegrationService,
    );

    return new PayPalCommerceButtonStrategy(
        paymentIntegrationService,
        paypalIntegrationService,
        paypalButtonCreationService,
    );
};

export default toResolvableModule(createPayPalCommerceButtonStrategy, [{ id: 'paypalcommerce' }]);
