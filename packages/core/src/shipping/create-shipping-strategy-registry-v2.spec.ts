import {
    PaymentIntegrationService,
    ShippingStrategy,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createShippingStrategyRegistryV2 from './create-shipping-strategy-registry-v2';

describe('createShippingStrategyRegistryV2', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('creates registry with factories pre-registered', () => {
        const fooStrategy = {} as ShippingStrategy;
        const registry = createShippingStrategyRegistryV2(paymentIntegrationService, {
            createFooStrategy: toResolvableModule(() => fooStrategy, [{ id: 'foo' }]),
        });
        const strategy = registry.get({ id: 'foo' });

        expect(strategy).toEqual(fooStrategy);
    });
});
