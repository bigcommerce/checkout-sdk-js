import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

import WalletButtonInitializer from './wallet-button-initializer';
import {
    BaseWalletButtonInitializeOptions,
    WalletButtonMethodType,
    WalletButtonOptions,
} from './wallet-button-options';
import WalletButtonRegistryV2 from './wallet-button-strategy-registry-v2';

describe('WalletButtonInitializer', () => {
    let initializer: WalletButtonInitializer;
    let registry: WalletButtonRegistryV2;
    let strategy: CheckoutButtonStrategy;
    let baseOptions: BaseWalletButtonInitializeOptions;
    let baseDeinitializeOptions: WalletButtonOptions;

    beforeEach(() => {
        strategy = {
            initialize: jest.fn().mockResolvedValue(undefined),
            deinitialize: jest.fn().mockResolvedValue(undefined),
        };

        registry = new ResolveIdRegistry();
        registry.register({ id: WalletButtonMethodType.PAYPALCOMMERCE }, () => strategy);

        initializer = new WalletButtonInitializer(registry);

        baseOptions = {
            methodId: WalletButtonMethodType.PAYPALCOMMERCE,
            containerId: 'wallet-button-container',
        };

        baseDeinitializeOptions = {
            methodId: WalletButtonMethodType.PAYPALCOMMERCE,
        };
    });

    describe('initializeWalletButton()', () => {
        it('initializes strategy with provided options', async () => {
            await initializer.initializeWalletButton(baseOptions);

            expect(strategy.initialize).toHaveBeenCalledWith(baseOptions);
        });

        it('returns array of promises for multiple containers', async () => {
            const container = document.createElement('div');

            container.className = 'wallet-button';
            document.body.appendChild(container);

            const container2 = container.cloneNode() as HTMLElement;

            document.body.appendChild(container2);

            const result = await initializer.initializeWalletButton({
                ...baseOptions,
                containerId: '.wallet-button',
            });

            expect(Array.isArray(result)).toBe(true);
            expect(strategy.initialize).toHaveBeenCalledTimes(2);

            container.remove();
            container2.remove();
        });
    });

    describe('deinitializeWalletButton()', () => {
        it('deinitializes strategy', async () => {
            await initializer.deinitializeWalletButton(baseDeinitializeOptions);

            expect(strategy.deinitialize).toHaveBeenCalled();
        });
    });
});
