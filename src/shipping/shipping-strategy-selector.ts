import { selector } from '../common/selector';

import ShippingStrategyState from './shipping-strategy-state';

@selector
export default class ShippingStrategySelector {
    constructor(
        private _shippingStrategies: ShippingStrategyState
    ) {}

    getUpdateAddressError(methodId?: string): Error | undefined {
        if (methodId && this._shippingStrategies.errors.updateAddressMethodId !== methodId) {
            return;
        }

        return this._shippingStrategies.errors.updateAddressError;
    }

    getSelectOptionError(methodId?: string): Error | undefined {
        if (methodId && this._shippingStrategies.errors.selectOptionMethodId !== methodId) {
            return;
        }

        return this._shippingStrategies.errors.selectOptionError;
    }

    getInitializeError(methodId?: string): Error | undefined {
        if (methodId && this._shippingStrategies.errors.initializeMethodId !== methodId) {
            return;
        }

        return this._shippingStrategies.errors.initializeError;
    }

    isUpdatingAddress(methodId?: string): boolean {
        if (methodId && this._shippingStrategies.statuses.updateAddressMethodId !== methodId) {
            return false;
        }

        return !!this._shippingStrategies.statuses.isUpdatingAddress;
    }

    isSelectingOption(methodId?: string): boolean {
        if (methodId && this._shippingStrategies.statuses.selectOptionMethodId !== methodId) {
            return false;
        }

        return !!this._shippingStrategies.statuses.isSelectingOption;
    }

    isInitializing(methodId?: string): boolean {
        if (methodId && this._shippingStrategies.statuses.initializeMethodId !== methodId) {
            return false;
        }

        return !!this._shippingStrategies.statuses.isInitializing;
    }

    isInitialized(methodId: string): boolean {
        return !!(
            this._shippingStrategies.data[methodId] &&
            this._shippingStrategies.data[methodId].isInitialized
        );
    }
}
