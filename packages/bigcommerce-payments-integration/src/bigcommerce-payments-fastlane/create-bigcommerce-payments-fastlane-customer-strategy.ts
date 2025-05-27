import {
    createBigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsSdk,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsFastlaneCustomerStrategy from './bigcommerce-payments-fastlane-customer-strategy';

const createBigCommercePaymentsFastlaneCustomerStrategy: CustomerStrategyFactory<
    BigCommercePaymentsFastlaneCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsFastlaneCustomerStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsSdk(),
        createBigCommercePaymentsFastlaneUtils(),
    );

export default toResolvableModule(createBigCommercePaymentsFastlaneCustomerStrategy, [
    { id: 'bigcommerce_payments_fastlane' }, // this method id will be provided for users from test group
    { id: 'bigcommerce_payments_creditcards' }, // this method id will be provided for users from control group
]);
