import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import BigCommerceRequestSender from '../big-commerce-request-sender';

import BigCommerceFastlanePaymentStrategy from './big-commerce-fastlane-payment-strategy';

const createBigCommerceFastlanePaymentStrategy: PaymentStrategyFactory<
    BigCommerceFastlanePaymentStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new BigCommerceFastlanePaymentStrategy(
        paymentIntegrationService,
        new BigCommerceRequestSender(createRequestSender({ host: getHost() })),
        createPayPalCommerceSdk(),
        createPayPalCommerceFastlaneUtils(),
    );
};

export default toResolvableModule(createBigCommerceFastlanePaymentStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' }, // PayPal Fastlane relates to 'paypalcommerceacceleratedcheckout' method id
]);
