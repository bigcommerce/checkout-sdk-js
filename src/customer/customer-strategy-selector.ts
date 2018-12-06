import CustomerStrategyState from './customer-strategy-state';

export default class CustomerStrategySelector {
    constructor(
        private _customerStrategies: CustomerStrategyState
    ) {}

    getSignInError(methodId?: string): Error | undefined {
        if (methodId && this._customerStrategies.errors.signInMethodId !== methodId) {
            return;
        }

        return this._customerStrategies.errors.signInError;
    }

    getSignOutError(methodId?: string): Error | undefined {
        if (methodId && this._customerStrategies.errors.signOutMethodId !== methodId) {
            return;
        }

        return this._customerStrategies.errors.signOutError;
    }

    getInitializeError(methodId?: string): Error | undefined {
        if (methodId && this._customerStrategies.errors.initializeMethodId !== methodId) {
            return;
        }

        return this._customerStrategies.errors.initializeError;
    }

    getWidgetInteractionError(methodId?: string): Error | undefined {
        if (methodId && this._customerStrategies.errors.widgetInteractionMethodId !== methodId) {
            return;
        }

        return this._customerStrategies.errors.widgetInteractionError;
    }

    isSigningIn(methodId?: string): boolean {
        if (methodId && this._customerStrategies.statuses.signInMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategies.statuses.isSigningIn;
    }

    isSigningOut(methodId?: string): boolean {
        if (methodId && this._customerStrategies.statuses.signOutMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategies.statuses.isSigningOut;
    }

    isInitializing(methodId?: string): boolean {
        if (methodId && this._customerStrategies.statuses.initializeMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategies.statuses.isInitializing;
    }

    isInitialized(methodId: string): boolean {
        return !!(
            this._customerStrategies.data[methodId] &&
            this._customerStrategies.data[methodId].isInitialized
        );
    }

    isWidgetInteracting(methodId?: string): boolean {
        if (methodId && this._customerStrategies.statuses.widgetInteractionMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategies.statuses.isWidgetInteracting;
    }}
