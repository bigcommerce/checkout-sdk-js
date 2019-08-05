import { find } from 'lodash';

import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import PaymentMethod from './payment-method';
import PaymentMethodMeta from './payment-method-meta';
import PaymentMethodState, { DEFAULT_STATE } from './payment-method-state';

export default interface PaymentMethodSelector {
    getPaymentMethods(): PaymentMethod[] | undefined;
    getPaymentMethodsMeta(): PaymentMethodMeta | undefined;
    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined;
    getLoadError(): Error | undefined;
    getLoadMethodError(methodId?: string): Error | undefined;
    isLoading(): boolean;
    isLoadingMethod(methodId?: string): boolean;
}

export type PaymentMethodSelectorFactory = (state: PaymentMethodState) => PaymentMethodSelector;

export function createPaymentMethodSelectorFactory(): PaymentMethodSelectorFactory {
    const getPaymentMethods = createSelector(
        (state: PaymentMethodState) => state.data,
        paymentMethods => () => paymentMethods
    );

    const getPaymentMethodsMeta = createSelector(
        (state: PaymentMethodState) => state.meta,
        meta => () => meta
    );

    const getPaymentMethod = createSelector(
        (state: PaymentMethodState) => state.data,
        paymentMethods => (methodId: string, gatewayId?: string) => {
            return gatewayId ?
                find(paymentMethods, { id: methodId, gateway: gatewayId }) :
                find(paymentMethods, { id: methodId });
        }
    );

    const getLoadError = createSelector(
        (state: PaymentMethodState) => state.errors.loadError,
        loadError => () => loadError
    );

    const getLoadMethodError = createSelector(
        (state: PaymentMethodState) => state.errors.loadMethodId,
        (state: PaymentMethodState) => state.errors.loadMethodError,
        (loadMethodId, loadMethodError) => (methodId?: string) => {
            if (methodId && loadMethodId !== methodId) {
                return;
            }

            return loadMethodError;
        }
    );

    const isLoading = createSelector(
        (state: PaymentMethodState) => state.statuses.isLoading,
        isLoading => () => !!isLoading
    );

    const isLoadingMethod = createSelector(
        (state: PaymentMethodState) => state.statuses.loadMethodId,
        (state: PaymentMethodState) => state.statuses.isLoadingMethod,
        (loadMethodId, isLoadingMethod) => (methodId?: string) => {
            if (methodId && loadMethodId !== methodId) {
                return false;
            }

            return !!isLoadingMethod;
        }
    );

    return memoizeOne((
        state: PaymentMethodState = DEFAULT_STATE
    ): PaymentMethodSelector => {
        return {
            getPaymentMethods: getPaymentMethods(state),
            getPaymentMethodsMeta: getPaymentMethodsMeta(state),
            getPaymentMethod: getPaymentMethod(state),
            getLoadError: getLoadError(state),
            getLoadMethodError: getLoadMethodError(state),
            isLoading: isLoading(state),
            isLoadingMethod: isLoadingMethod(state),
        };
    });
}
