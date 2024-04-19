import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';

import createShippingStrategyRegistry from './create-shipping-strategy-registry';
import { ShippingStrategy } from './strategies';
import { AmazonPayV2ShippingStrategy } from './strategies/amazon-pay-v2';
import { BraintreeAcceleratedCheckoutShippingStrategy } from './strategies/braintree';
import { PayPalCommerceFastlaneShippingStrategy } from './strategies/paypal-commerce';

describe('CreateShippingStrategyRegistry', () => {
    let registry: Registry<ShippingStrategy>;

    beforeEach(() => {
        const store = createCheckoutStore();
        const requestSender = createRequestSender();

        registry = createShippingStrategyRegistry(store, requestSender);
    });

    it('can instantiate amazon pay', () => {
        const shippingStrategy = registry.get('amazonpay');

        expect(shippingStrategy).toBeInstanceOf(AmazonPayV2ShippingStrategy);
    });

    it('can instantiate braintree accelerated checkout', () => {
        const shippingStrategy = registry.get('braintreeacceleratedcheckout');

        expect(shippingStrategy).toBeInstanceOf(BraintreeAcceleratedCheckoutShippingStrategy);
    });

    it('can instantiate paypal commerce fastlane shipping strategy', () => {
        const shippingStrategy = registry.get('paypalcommerceacceleratedcheckout');

        expect(shippingStrategy).toBeInstanceOf(PayPalCommerceFastlaneShippingStrategy);
    });
});
