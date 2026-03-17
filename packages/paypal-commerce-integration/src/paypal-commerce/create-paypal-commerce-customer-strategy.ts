import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    PaypalButtonCreationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCustomerStrategy from './paypal-commerce-customer-strategy';

const createPayPalCommerceCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceCustomerStrategy
> = (paymentIntegrationService) => {
    const paypalIntegrationService = createPayPalIntegrationService(paymentIntegrationService);
    const paypalButtonCreationService = new PaypalButtonCreationService(
        paymentIntegrationService,
        paypalIntegrationService,
    );

    return new PayPalCommerceCustomerStrategy(
        paymentIntegrationService,
        paypalIntegrationService,
        paypalButtonCreationService,
    );
};

export default toResolvableModule(createPayPalCommerceCustomerStrategy, [{ id: 'paypalcommerce' }]);
