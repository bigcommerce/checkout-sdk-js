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
    let registry: ResolveIdRegistry<MockStrategy, { id: string; type?: string }>;
    let paymentIntegrationService: PaymentIntegrationService;
    let mockFactory: StrategyFactory<MockStrategy>;
    let anotherMockFactory: StrategyFactory<MockStrategy>;
    let mockStrategy: MockStrategy;
    let anotherMockStrategy: MockStrategy;

    beforeEach(() => {
        registry = new ResolveIdRegistry(true);
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        mockFactory = Object.assign(
            (service: PaymentIntegrationService) => {
                mockStrategy = new MockStrategy(service);

                return mockStrategy;
            },
            { resolveIds: [{ id: 'mock-strategy' }] },
        );

        anotherMockFactory = Object.assign(
            (service: PaymentIntegrationService) => {
                anotherMockStrategy = new MockStrategy(service);

                return anotherMockStrategy;
            },
            { resolveIds: [{ id: 'another-strategy' }] },
        );
    });

    describe('when registering integrations', () => {
        it('should register resolvable integrations in the registry', () => {
            const integrations = [mockFactory, anotherMockFactory];

            registerIntegrations(registry, integrations, paymentIntegrationService);

            const registeredStrategy = registry.get({ id: 'mock-strategy' });
            const anotherRegisteredStrategy = registry.get({ id: 'another-strategy' });

            expect(registeredStrategy).toBe(mockStrategy);
            expect(anotherRegisteredStrategy).toBe(anotherMockStrategy);
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

            expect(registeredStrategy).toBe(mockStrategy);
        });

        it('should do exact match when determining if registration if needed', () => {
            const defaultFactory = Object.assign(
                (service: PaymentIntegrationService) => new MockStrategy(service),
                { resolveIds: [{ default: true }] },
            );
            const anotherMockFactory = Object.assign(
                (service: PaymentIntegrationService) => {
                    anotherMockStrategy = new MockStrategy(service);

                    return anotherMockStrategy;
                },
                { resolveIds: [{ id: 'mock-strategy', type: 'mock-type' }] },
            );

            registerIntegrations(registry, [defaultFactory], paymentIntegrationService);
            registerIntegrations(registry, [mockFactory], paymentIntegrationService);
            registerIntegrations(registry, [anotherMockFactory], paymentIntegrationService);

            expect(registry.get({ id: 'mock-strategy' })).toBe(mockStrategy);
            expect(registry.get({ id: 'mock-strategy', type: 'mock-type' })).toBe(
                anotherMockStrategy,
            );
        });
    });
});
