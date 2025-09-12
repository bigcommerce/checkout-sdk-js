import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { ResolveIdRegistry } from '../common/registry';

import { registerIntegrations, StrategyFactory } from './register-integrations';

class MockStrategy {
    constructor(private _service: PaymentIntegrationService) {}

    getService() {
        return this._service;
    }
}

describe('registerIntegrations', () => {
    let registry: ResolveIdRegistry<MockStrategy, { id: string }>;
    let paymentIntegrationService: PaymentIntegrationService;
    let mockFactory: StrategyFactory<MockStrategy>;
    let anotherMockFactory: StrategyFactory<MockStrategy>;

    beforeEach(() => {
        registry = new ResolveIdRegistry<MockStrategy, { id: string }>();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        mockFactory = Object.assign(
            (service: PaymentIntegrationService) => new MockStrategy(service),
            { resolveIds: [{ id: 'mock-strategy' }] },
        );

        anotherMockFactory = Object.assign(
            (service: PaymentIntegrationService) => new MockStrategy(service),
            { resolveIds: [{ id: 'another-strategy' }] },
        );
    });

    describe('when registering integrations', () => {
        it('should register resolvable integrations in the registry', () => {
            const integrations = [mockFactory, anotherMockFactory];

            registerIntegrations(registry, integrations, paymentIntegrationService);

            const registeredStrategy = registry.get({ id: 'mock-strategy' });
            const anotherRegisteredStrategy = registry.get({ id: 'another-strategy' });

            expect(registeredStrategy).toBeInstanceOf(MockStrategy);
            expect(anotherRegisteredStrategy).toBeInstanceOf(MockStrategy);
        });

        it('should skip registration if a factory is already registered for the same resolve ID', () => {
            const originalFactory = mockFactory;
            const duplicateFactory = Object.assign(
                (service: PaymentIntegrationService) => new MockStrategy(service),
                { resolveIds: [{ id: 'mock-strategy' }] },
            );

            registerIntegrations(registry, [originalFactory], paymentIntegrationService);
            registerIntegrations(registry, [duplicateFactory], paymentIntegrationService);

            const registeredStrategy = registry.get({ id: 'mock-strategy' });

            expect(registeredStrategy).toBeInstanceOf(MockStrategy);
        });
    });
});
