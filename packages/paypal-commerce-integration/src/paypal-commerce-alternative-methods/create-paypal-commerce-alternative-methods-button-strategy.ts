import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    PaypalButtonCreationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceAlternativeMethodsButtonStrategy from './paypal-commerce-alternative-methods-button-strategy';

const createPayPalCommerceAlternativeMethodsButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceAlternativeMethodsButtonStrategy
> = (paymentIntegrationService) => {
    const paypalIntegrationService = createPayPalIntegrationService(paymentIntegrationService);
    const paypalButtonCreationService = new PaypalButtonCreationService(
        paymentIntegrationService,
        paypalIntegrationService,
    );

    return new PayPalCommerceAlternativeMethodsButtonStrategy(
        paymentIntegrationService,
        paypalIntegrationService,
        paypalButtonCreationService,
    );
};

export default toResolvableModule(createPayPalCommerceAlternativeMethodsButtonStrategy, [
    { id: 'paypalcommercealternativemethods' },
]);
