import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalCommerceAcceleratedCheckoutUtils,
    createPayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';

import PayPalCommerceAcceleratedCheckoutPaymentStrategy from './paypal-commerce-accelerated-checkout-payment-strategy';

const createPayPalCommerceAcceleratedCheckoutPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceAcceleratedCheckoutPaymentStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new PayPalCommerceAcceleratedCheckoutPaymentStrategy(
        paymentIntegrationService,
        new PayPalCommerceRequestSender(createRequestSender({ host: getHost() })),
        createPayPalCommerceSdk(),
        createPayPalCommerceAcceleratedCheckoutUtils(),
    );
};

export default toResolvableModule(createPayPalCommerceAcceleratedCheckoutPaymentStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' },
]);
