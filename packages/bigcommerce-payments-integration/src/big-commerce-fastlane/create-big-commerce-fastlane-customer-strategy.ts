import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import BigCommerceFastlaneCustomerStrategy from './big-commerce-fastlane-customer-strategy';

const createBigCommerceFastlaneCustomerStrategy: CustomerStrategyFactory<
    BigCommerceFastlaneCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommerceFastlaneCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceSdk(),
        createPayPalCommerceFastlaneUtils(),
    );

export default toResolvableModule(createBigCommerceFastlaneCustomerStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' }, // this method id will be provided for users from test group
    { id: 'paypalcommercecreditcards' }, // this method id will be provided for users from control group
]);
