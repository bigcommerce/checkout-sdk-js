import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    PaypalButtonCreationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCreditCustomerStrategy from './paypal-commerce-credit-customer-strategy';

const createPayPalCommerceCreditCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceCreditCustomerStrategy
> = (paymentIntegrationService) => {
    const paypalIntegrationService = createPayPalIntegrationService(paymentIntegrationService);
    const buttonCreationService = new PaypalButtonCreationService(
        paymentIntegrationService,
        paypalIntegrationService,
    );

    return new PayPalCommerceCreditCustomerStrategy(
        paymentIntegrationService,
        paypalIntegrationService,
        buttonCreationService,
    );
};

export default toResolvableModule(createPayPalCommerceCreditCustomerStrategy, [
    { id: 'paypalcommercecredit' },
]);
