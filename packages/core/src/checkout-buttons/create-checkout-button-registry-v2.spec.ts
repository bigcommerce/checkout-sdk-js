import {
    CheckoutButtonStrategy,
    PaymentIntegrationService,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createCheckoutButtonStrategyRegistry from './create-checkout-button-registry-v2';

describe('createCheckoutButtonStrategyRegistry', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('creates registry with factories pre-registered', () => {
        const fooStrategy = {} as CheckoutButtonStrategy;
        const registry = createCheckoutButtonStrategyRegistry(paymentIntegrationService, {
            createFooStrategy: toResolvableModule(
                () => fooStrategy,
                [{ id: 'foo', gateway: null, type: 'api' }],
            ),
        });
        const strategy = registry.get({ id: 'foo' });

        expect(strategy).toEqual(fooStrategy);
    });
});
