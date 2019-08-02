import { find, some, values } from 'lodash';

import { createSelector } from '../common/selector';
import { memoize, memoizeOne } from '../common/utility';

import CheckoutButtonState, { DEFAULT_STATE } from './checkout-button-state';
import { CheckoutButtonMethodType } from './strategies';

export default interface CheckoutButtonSelector {
    getState(): CheckoutButtonState;
    isInitializing(methodId?: CheckoutButtonMethodType): boolean;
    isInitialized(methodId: CheckoutButtonMethodType, containerId?: string): boolean;
    isDeinitializing(methodId?: CheckoutButtonMethodType): boolean;
    getInitializeError(methodId?: CheckoutButtonMethodType): Error | undefined;
    getDeinitializeError(methodId?: CheckoutButtonMethodType): Error | undefined;
}

export type CheckoutButtonSelectorFactory = (state: CheckoutButtonState) => CheckoutButtonSelector;

export function createCheckoutButtonSelectorFactory(): CheckoutButtonSelectorFactory {
    const getState = createSelector(
        (state: CheckoutButtonState) => state,
        state => () => state
    );

    const isInitializing = createSelector(
        (state: CheckoutButtonState) => state.statuses,
        statuses => memoize((methodId?: CheckoutButtonMethodType) => {
            if (methodId) {
                const method = statuses[methodId];

                return (method && method.isInitializing) === true;
            }

            return some(statuses, { isInitializing: true });
        })
    );

    const isInitialized = createSelector(
        (state: CheckoutButtonState) => state.data,
        data => memoize((methodId: CheckoutButtonMethodType, containerId?: string) => {
            const method = data[methodId];

            if (!method) {
                return false;
            }

            if (!containerId) {
                return some(method.initializedContainers, isInitialized => isInitialized === true);
            }

            return method.initializedContainers[containerId] === true;
        })
    );

    const isDeinitializing = createSelector(
        (state: CheckoutButtonState) => state.statuses,
        statuses => memoize((methodId?: CheckoutButtonMethodType) => {
            if (methodId) {
                const method = statuses[methodId];

                return (method && method.isDeinitializing) === true;
            }

            return some(statuses, { isDeinitializing: true });
        })
    );

    const getInitializeError = createSelector(
        (state: CheckoutButtonState) => state.errors,
        errors => memoize((methodId?: CheckoutButtonMethodType) => {
            const method = methodId ?
                errors[methodId] :
                find(values(errors), method => !!(method && method.initializeError));

            return method && method.initializeError;
        })
    );

    const getDeinitializeError = createSelector(
        (state: CheckoutButtonState) => state.errors,
        errors => memoize((methodId?: CheckoutButtonMethodType) => {
            const method = methodId ?
                errors[methodId] :
                find(values(errors), method => !!(method && method.deinitializeError));

            return method && method.deinitializeError;
        })
    );

    return memoizeOne((
        state: CheckoutButtonState = DEFAULT_STATE
    ): CheckoutButtonSelector => {
        return {
            getState: getState(state),
            isInitializing: isInitializing(state),
            isInitialized: isInitialized(state),
            isDeinitializing: isDeinitializing(state),
            getInitializeError: getInitializeError(state),
            getDeinitializeError: getDeinitializeError(state),
        };
    });
}
