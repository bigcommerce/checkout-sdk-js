import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalFastlaneUtils,
    createPayPalSdkScriptLoader,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceFastlaneCustomerStrategy from './paypal-commerce-fastlane-customer-strategy';

const createPayPalCommerceFastlaneCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceFastlaneCustomerStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceFastlaneCustomerStrategy(
        paymentIntegrationService,
        createPayPalSdkScriptLoader(),
        createPayPalFastlaneUtils(),
    );

export default toResolvableModule(createPayPalCommerceFastlaneCustomerStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' }, // this method id will be provided for users from test group
    { id: 'paypalcommercecreditcards' }, // this method id will be provided for users from control group
]);
