import ShippingStrategyState from './shipping-strategy-state';

export default class ShippingStrategySelector {
    constructor(
        private _shippingStrategy: ShippingStrategyState
    ) {}

    getUpdateAddressError(methodId?: string): Error | undefined {
        if (methodId && this._shippingStrategy.errors.updateAddressMethodId !== methodId) {
            return;
        }

        return this._shippingStrategy.errors.updateAddressError;
    }

    getSelectOptionError(methodId?: string): Error | undefined {
        if (methodId && this._shippingStrategy.errors.selectOptionMethodId !== methodId) {
            return;
        }

        return this._shippingStrategy.errors.selectOptionError;
    }

    getInitializeError(methodId?: string): Error | undefined {
        if (methodId && this._shippingStrategy.errors.initializeMethodId !== methodId) {
            return;
        }

        return this._shippingStrategy.errors.initializeError;
    }

    isUpdatingAddress(methodId?: string): boolean {
        if (methodId && this._shippingStrategy.statuses.updateAddressMethodId !== methodId) {
            return false;
        }

        return !!this._shippingStrategy.statuses.isUpdatingAddress;
    }

    isSelectingOption(methodId?: string): boolean {
        if (methodId && this._shippingStrategy.statuses.selectOptionMethodId !== methodId) {
            return false;
        }

        return !!this._shippingStrategy.statuses.isSelectingOption;
    }

    isInitializing(methodId?: string): boolean {
        if (methodId && this._shippingStrategy.statuses.initializeMethodId !== methodId) {
            return false;
        }

        return !!this._shippingStrategy.statuses.isInitializing;
    }
}
