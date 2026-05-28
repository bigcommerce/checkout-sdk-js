import { bindDecorator as bind } from '@bigcommerce/checkout-sdk/utility';

import { isElementId, setUniqueElementId } from '../common/dom';

import { BaseWalletButtonInitializeOptions, WalletButtonOptions } from './wallet-button-options';
import WalletButtonRegistryV2 from './wallet-button-strategy-registry-v2';

@bind
export default class WalletButtonInitializer {
    constructor(private _registryV2: WalletButtonRegistryV2) {}

    initializeWalletButton(options: BaseWalletButtonInitializeOptions): Promise<void[]> {
        const containerIds = this.getContainerIds(options);

        return Promise.all(
            containerIds.map(async (containerId) => {
                const strategy = this._registryV2.get({ id: options.methodId });

                return strategy.initialize({ ...options, containerId });
            }),
        );
    }

    deinitializeWalletButton(options: WalletButtonOptions): Promise<void> {
        return this._registryV2.get({ id: options.methodId }).deinitialize();
    }

    private getContainerIds(options: BaseWalletButtonInitializeOptions) {
        return isElementId(options.containerId)
            ? [options.containerId]
            : setUniqueElementId(options.containerId, `${options.methodId}-container`);
    }
}
