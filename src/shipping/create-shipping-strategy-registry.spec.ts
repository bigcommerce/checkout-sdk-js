import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';

import createShippingStrategyRegistry from './create-shipping-strategy-registry';
import { ShippingStrategy } from './strategies';
import { AmazonPayShippingStrategy } from './strategies/amazon';

describe('CreateShippingStrategyRegistry', () => {
    let registry: Registry<ShippingStrategy>;

    beforeEach(() => {
        const store = createCheckoutStore();
        const requestSender = createRequestSender();
        registry = createShippingStrategyRegistry(store, requestSender);
    });

    it('can instantiate amazon', () => {
        const shippingStrategy = registry.get('amazon');
        expect(shippingStrategy).toBeInstanceOf(AmazonPayShippingStrategy);
    });
});
