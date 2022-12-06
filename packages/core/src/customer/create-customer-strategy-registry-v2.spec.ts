import {
    CustomerStrategy,
    PaymentIntegrationService,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createCustomerStrategyRegistry from './create-customer-strategy-registry-v2';

describe('createCustomerStrategyRegistry', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService =
            new PaymentIntegrationServiceMock() as PaymentIntegrationService;
    });

    it('creates registry with factories pre-registered', () => {
        const fooStrategy = {} as CustomerStrategy;
        const registry = createCustomerStrategyRegistry(paymentIntegrationService, {
            createFooStrategy: toResolvableModule(
                () => fooStrategy,
                [{ id: 'foo', gateway: null, type: 'api' }],
            ),
        });
        const strategy = registry.get({ id: 'foo' });

        expect(strategy).toEqual(fooStrategy);
    });
});
