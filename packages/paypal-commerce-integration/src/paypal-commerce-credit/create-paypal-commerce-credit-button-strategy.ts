import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    PaypalButtonCreationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

const createPayPalCommerceCreditButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceCreditButtonStrategy
> = (paymentIntegrationService) => {
    const paypalIntegrationService = createPayPalIntegrationService(paymentIntegrationService);
    const buttonCreationService = new PaypalButtonCreationService(
        paymentIntegrationService,
        paypalIntegrationService,
    );

    return new PayPalCommerceCreditButtonStrategy(
        paymentIntegrationService,
        paypalIntegrationService,
        buttonCreationService,
    );
};

export default toResolvableModule(createPayPalCommerceCreditButtonStrategy, [
    { id: 'paypalcommercecredit' },
]);
