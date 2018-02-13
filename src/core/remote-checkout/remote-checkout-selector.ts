import RemoteCheckoutState from './remote-checkout-state';
import RemoteCheckout from './remote-checkout';
import RemoteCheckoutMeta from './remote-checkout-meta';

export default class RemoteCheckoutSelector {
    constructor(
        private _remoteCheckout: RemoteCheckoutState
    ) { }

    getCheckout(): RemoteCheckout | undefined {
        return this._remoteCheckout.data;
    }

    getCheckoutMeta(): RemoteCheckoutMeta | undefined {
        return this._remoteCheckout.meta;
    }

    getInitializeBillingError(methodId?: string): any {
        if (methodId && this._remoteCheckout.errors.failedBillingMethod !== methodId) {
            return false;
        }

        return this._remoteCheckout.errors.initializeBillingError;
    }

    getInitializeShippingError(methodId?: string): any {
        if (methodId && this._remoteCheckout.errors.failedShippingMethod !== methodId) {
            return false;
        }

        return this._remoteCheckout.errors.initializeShippingError;
    }

    getInitializePaymentError(methodId?: string): any {
        if (methodId && this._remoteCheckout.errors.failedPaymentMethod !== methodId) {
            return false;
        }

        return this._remoteCheckout.errors.initializePaymentError;
    }

    getSignOutError(): any {
        return this._remoteCheckout.errors.signOutError;
    }

    isInitializingBilling(methodId?: string): boolean {
        if (methodId && this._remoteCheckout.statuses.loadingBillingMethod !== methodId) {
            return false;
        }

        return !!this._remoteCheckout.statuses.isInitializingBilling;
    }

    isInitializingShipping(): boolean {
        return !!this._remoteCheckout.statuses.isInitializingShipping;
    }

    isInitializingPayment(methodId?: string): boolean {
        if (methodId && this._remoteCheckout.statuses.loadingPaymentMethod !== methodId) {
            return false;
        }

        return !!this._remoteCheckout.statuses.isInitializingPayment;
    }

    isSigningOut(): boolean {
        return !!this._remoteCheckout.statuses.isSigningOut;
    }
}
