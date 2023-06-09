import {
    PaymentIntegrationService,
    PaymentStrategy,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPaymentStrategyRegistry from './create-payment-strategy-registry-v2';

describe('createPaymentStrategyRegistry', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('creates registry with factories pre-registered', () => {
        const fooStrategy = {} as PaymentStrategy;
        const registry = createPaymentStrategyRegistry(paymentIntegrationService, {
            createFooStrategy: toResolvableModule(
                () => fooStrategy,
                [{ id: 'foo', gateway: null, type: 'api' }],
            ),
        });
        const strategy = registry.get({ id: 'foo', type: 'api' });

        expect(strategy).toEqual(fooStrategy);
    });
});
