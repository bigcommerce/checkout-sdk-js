import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import B2BCompanyPaymentMethod from './b2b-company-payment-method';
import B2BCompanyPaymentMethodState, { DEFAULT_STATE } from './b2b-company-payment-method-state';

export default interface B2BCompanyPaymentMethodSelector {
    getB2BCompanyPaymentMethods(): B2BCompanyPaymentMethod[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type B2BCompanyPaymentMethodSelectorFactory = (
    state: B2BCompanyPaymentMethodState,
) => B2BCompanyPaymentMethodSelector;

export function createB2BCompanyPaymentMethodSelectorFactory(): B2BCompanyPaymentMethodSelectorFactory {
    const getB2BCompanyPaymentMethods = createSelector(
        (state: B2BCompanyPaymentMethodState) => state.data,
        (methods) => () => methods,
    );

    const getLoadError = createSelector(
        (state: B2BCompanyPaymentMethodState) => state.errors.loadError,
        (error) => () => error,
    );

    const isLoading = createSelector(
        (state: B2BCompanyPaymentMethodState) => !!state.statuses.isLoading,
        (status) => () => status,
    );

    return memoizeOne(
        (state: B2BCompanyPaymentMethodState = DEFAULT_STATE): B2BCompanyPaymentMethodSelector => {
            return {
                getB2BCompanyPaymentMethods: getB2BCompanyPaymentMethods(state),
                getLoadError: getLoadError(state),
                isLoading: isLoading(state),
            };
        },
    );
}
