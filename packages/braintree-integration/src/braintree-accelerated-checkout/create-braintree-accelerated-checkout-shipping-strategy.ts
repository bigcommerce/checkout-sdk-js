import {
    ShippingStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeAcceleratedCheckoutShippingStrategy from './braintree-accelerated-checkout-shipping-strategy';

const createBraintreeAcceleratedCheckoutShippingStrategy: ShippingStrategyFactory<
    BraintreeAcceleratedCheckoutShippingStrategy
> = (paymentIntegrationService) => {
    return new BraintreeAcceleratedCheckoutShippingStrategy(paymentIntegrationService);
};

export default toResolvableModule(createBraintreeAcceleratedCheckoutShippingStrategy, [
    { id: 'braintreeacceleratedcheckout' },
]);
