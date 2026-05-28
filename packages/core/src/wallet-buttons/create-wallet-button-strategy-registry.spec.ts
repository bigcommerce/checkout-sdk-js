import {
    CheckoutButtonStrategy,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import createWalletButtonStrategyRegistry from './create-wallet-button-strategy-registry';

describe('createWalletButtonStrategyRegistry', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;
    let testStrategy: CheckoutButtonStrategy;

    beforeEach(() => {
        walletButtonIntegrationService = new WalletButtonIntegrationService('/graphql');
        testStrategy = {
            initialize: jest.fn(),
            deinitialize: jest.fn(),
        };
    });

    it('creates registry with factories pre-registered', () => {
        const registry = createWalletButtonStrategyRegistry(walletButtonIntegrationService, {
            createTestStrategy: toResolvableModule(() => testStrategy, [{ id: 'test' }]),
        });
        const strategy = registry.get({ id: 'test' });

        expect(strategy).toEqual(testStrategy);
    });

    it('skips non-resolvable modules', () => {
        const registry = createWalletButtonStrategyRegistry(walletButtonIntegrationService, {
            notResolvable: (() => ({})) as any,
        });

        expect(() => registry.get({ id: 'notResolvable' })).toThrow();
    });

    it('registers multiple resolve IDs for a single factory', () => {
        const registry = createWalletButtonStrategyRegistry(walletButtonIntegrationService, {
            createTestStrategy: toResolvableModule(
                () => testStrategy,
                [{ id: 'test' }, { id: 'mock' }],
            ),
        });

        expect(registry.get({ id: 'test' })).toEqual(testStrategy);
        expect(registry.get({ id: 'mock' })).toEqual(testStrategy);
    });
});
