import { selector } from '../common/selector';

import PaymentStrategyState, { DEFAULT_STATE } from './payment-strategy-state';

@selector
export default class PaymentStrategySelector {
    constructor(
        private _paymentStrategies: PaymentStrategyState = DEFAULT_STATE
    ) {}

    getInitializeError(methodId?: string): Error | undefined {
        if (methodId && this._paymentStrategies.errors.initializeMethodId !== methodId) {
            return;
        }

        return this._paymentStrategies.errors.initializeError;
    }

    getExecuteError(methodId?: string): Error | undefined {
        if (methodId && this._paymentStrategies.errors.executeMethodId !== methodId) {
            return;
        }

        return this._paymentStrategies.errors.executeError;
    }

    getFinalizeError(methodId?: string): Error | undefined {
        if (methodId && this._paymentStrategies.errors.finalizeMethodId !== methodId) {
            return;
        }

        return this._paymentStrategies.errors.finalizeError;
    }

    getWidgetInteractingError(methodId?: string): Error | undefined {
        if (methodId && this._paymentStrategies.errors.widgetInteractionMethodId !== methodId) {
            return;
        }

        return this._paymentStrategies.errors.widgetInteractionError;
    }

    isInitializing(methodId?: string): boolean {
        if (methodId && this._paymentStrategies.statuses.initializeMethodId !== methodId) {
            return false;
        }

        return !!this._paymentStrategies.statuses.isInitializing;
    }

    isExecuting(methodId?: string): boolean {
        if (methodId && this._paymentStrategies.statuses.executeMethodId !== methodId) {
            return false;
        }

        return !!this._paymentStrategies.statuses.isExecuting;
    }

    isFinalizing(methodId?: string): boolean {
        if (methodId && this._paymentStrategies.statuses.finalizeMethodId !== methodId) {
            return false;
        }

        return !!this._paymentStrategies.statuses.isFinalizing;
    }

    isWidgetInteracting(methodId?: string): boolean {
        if (methodId && this._paymentStrategies.statuses.widgetInteractionMethodId !== methodId) {
            return false;
        }

        return !!this._paymentStrategies.statuses.isWidgetInteracting;
    }
}
