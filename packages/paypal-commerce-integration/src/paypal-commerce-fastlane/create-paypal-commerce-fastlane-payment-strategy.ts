import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalFastlaneUtils,
    createPayPalSdkScriptLoader,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';

import PayPalCommerceFastlanePaymentStrategy from './paypal-commerce-fastlane-payment-strategy';

const createPayPalCommerceFastlanePaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceFastlanePaymentStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PayPalCommerceFastlanePaymentStrategy(
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        createPayPalSdkScriptLoader(),
        createPayPalFastlaneUtils(),
    );
};

export default toResolvableModule(createPayPalCommerceFastlanePaymentStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' }, // PayPal Fastlane relates to 'paypalcommerceacceleratedcheckout' method id
]);
