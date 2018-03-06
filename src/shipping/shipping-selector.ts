import ShippingState from './shipping-state';

export default class ShippingSelector {
    constructor(
        private _shipping: ShippingState
    ) {}

    isInitializing(methodId?: string): boolean {
        if (methodId && this._shipping.statuses.initializingMethod !== methodId) {
            return false;
        }

        return !!this._shipping.statuses.isInitializing;
    }

    getInitializeError(methodId?: string): any {
        if (methodId && this._shipping.errors.initializeMethod !== methodId) {
            return;
        }

        return this._shipping.errors.initializeError;
    }
}
