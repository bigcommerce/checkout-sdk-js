import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    PaypalButtonCreationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceVenmoButtonStrategy from './paypal-commerce-venmo-button-strategy';

const createPayPalCommerceVenmoButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceVenmoButtonStrategy
> = (paymentIntegrationService) => {
    const paypalIntegrationService = createPayPalIntegrationService(paymentIntegrationService);
    const buttonCreationService = new PaypalButtonCreationService(
        paymentIntegrationService,
        paypalIntegrationService,
    );

    return new PayPalCommerceVenmoButtonStrategy(
        paymentIntegrationService,
        paypalIntegrationService,
        buttonCreationService,
    );
};

export default toResolvableModule(createPayPalCommerceVenmoButtonStrategy, [
    { id: 'paypalcommercevenmo' },
]);
