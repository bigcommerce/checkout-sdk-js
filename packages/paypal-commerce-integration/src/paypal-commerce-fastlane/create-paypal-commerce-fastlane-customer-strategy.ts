import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceFastlaneCustomerStrategy from './paypal-commerce-fastlane-customer-strategy';

const createPayPalCommerceFastlaneCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceFastlaneCustomerStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceFastlaneCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceSdk(),
        createPayPalCommerceFastlaneUtils(),
    );

export default toResolvableModule(createPayPalCommerceFastlaneCustomerStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' }, // this method id will be provided for users from test group
    { id: 'paypalcommercecreditcards' }, // this method id will be provided for users from control group
]);
