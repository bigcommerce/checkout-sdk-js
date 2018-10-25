import { find, some, values } from 'lodash';

import { selector } from '../common/selector';

import CheckoutButtonState from './checkout-button-state';
import { CheckoutButtonMethodType } from './strategies';

@selector
export default class CheckoutButtonSelector {
    constructor(
        private _checkoutButton: CheckoutButtonState
    ) {}

    getState(): CheckoutButtonState {
        return this._checkoutButton;
    }

    isInitializing(methodId?: CheckoutButtonMethodType): boolean {
        if (methodId) {
            const method = this._checkoutButton.statuses[methodId];

            return (method && method.isInitializing) === true;
        }

        return some(this._checkoutButton.statuses, { isInitializing: true });
    }

    isDeinitializing(methodId?: CheckoutButtonMethodType): boolean {
        if (methodId) {
            const method = this._checkoutButton.statuses[methodId];

            return (method && method.isDeinitializing) === true;
        }

        return some(this._checkoutButton.statuses, { isDeinitializing: true });
    }

    getInitializeError(methodId?: CheckoutButtonMethodType): Error | undefined {
        const method = methodId ?
            this._checkoutButton.errors[methodId] :
            find(values(this._checkoutButton.errors), method => !!(method && method.initializeError));

        return method && method.initializeError;
    }

    getDeinitializeError(methodId?: CheckoutButtonMethodType): Error | undefined {
        const method = methodId ?
            this._checkoutButton.errors[methodId] :
            find(values(this._checkoutButton.errors), method => !!(method && method.deinitializeError));

        return method && method.deinitializeError;
    }
}
