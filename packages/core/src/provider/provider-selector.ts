import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import ProviderCustomerDataState, { DEFAULT_STATE } from './provider-state';

export default interface ProviderCustomerDataSelector {
    getProviderCustomerData<T>(): T | undefined;
    getProviderCustomerDataOrThrow<T>(): T;
}

export type ProviderCustomerDataSelectorFactory = (
    state: ProviderCustomerDataState,
) => ProviderCustomerDataSelector;

export function createProviderCustomerDataSelectorFactory(): ProviderCustomerDataSelectorFactory {
    const getProviderCustomerData = createSelector(
        (state: ProviderCustomerDataState) => state.data,
        (data) => () => data,
    );

    const getProviderCustomerDataOrThrow = createSelector(
        getProviderCustomerData,
        (getProviderCustomerData) => () => {
            return guard(
                getProviderCustomerData(),
                () => new MissingDataError(MissingDataErrorType.MissingProviderCustomerData),
            );
        },
    );

    return memoizeOne(
        (state: ProviderCustomerDataState = DEFAULT_STATE): ProviderCustomerDataSelector => {
            return {
                getProviderCustomerData: getProviderCustomerData(state),
                getProviderCustomerDataOrThrow: getProviderCustomerDataOrThrow(state),
            };
        },
    );
}
