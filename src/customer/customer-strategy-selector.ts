import CustomerStrategyState from './customer-strategy-state';

export default class CustomerStrategySelector {
    constructor(
        private _customerStrategy: CustomerStrategyState
    ) {}

    getSignInError(methodId?: string): Error | undefined {
        if (methodId && this._customerStrategy.errors.signInMethodId !== methodId) {
            return;
        }

        return this._customerStrategy.errors.signInError;
    }

    getSignOutError(methodId?: string): Error | undefined {
        if (methodId && this._customerStrategy.errors.signOutMethodId !== methodId) {
            return;
        }

        return this._customerStrategy.errors.signOutError;
    }

    getInitializeError(methodId?: string): Error | undefined {
        if (methodId && this._customerStrategy.errors.initializeMethodId !== methodId) {
            return;
        }

        return this._customerStrategy.errors.initializeError;
    }

    isSigningIn(methodId?: string): boolean {
        if (methodId && this._customerStrategy.statuses.signInMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isSigningIn;
    }

    isSigningOut(methodId?: string): boolean {
        if (methodId && this._customerStrategy.statuses.signOutMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isSigningOut;
    }

    isInitializing(methodId?: string): boolean {
        if (methodId && this._customerStrategy.statuses.initializeMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isInitializing;
    }
}
