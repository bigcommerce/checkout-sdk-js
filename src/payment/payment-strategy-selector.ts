import PaymentStrategyState, { DEFAULT_STATE } from './payment-strategy-state';

export default class PaymentStrategySelector {
    constructor(
        private _paymentStrategy: PaymentStrategyState = DEFAULT_STATE
    ) {}

    getInitializeError(methodId?: string): Error | undefined {
        if (methodId && this._paymentStrategy.errors.initializeMethodId !== methodId) {
            return;
        }

        return this._paymentStrategy.errors.initializeError;
    }

    getExecuteError(methodId?: string): Error | undefined {
        if (methodId && this._paymentStrategy.errors.executeMethodId !== methodId) {
            return;
        }

        return this._paymentStrategy.errors.executeError;
    }

    getFinalizeError(methodId?: string): Error | undefined {
        if (methodId && this._paymentStrategy.errors.finalizeMethodId !== methodId) {
            return;
        }

        return this._paymentStrategy.errors.finalizeError;
    }

    isInitializing(methodId?: string): boolean {
        if (methodId && this._paymentStrategy.statuses.initializeMethodId !== methodId) {
            return false;
        }

        return !!this._paymentStrategy.statuses.isInitializing;
    }

    isExecuting(methodId?: string): boolean {
        if (methodId && this._paymentStrategy.statuses.executeMethodId !== methodId) {
            return false;
        }

        return !!this._paymentStrategy.statuses.isExecuting;
    }

    isFinalizing(methodId?: string): boolean {
        if (methodId && this._paymentStrategy.statuses.finalizeMethodId !== methodId) {
            return false;
        }

        return !!this._paymentStrategy.statuses.isFinalizing;
    }
}
