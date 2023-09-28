import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import { PaymentProviderAuthentication } from './payment-provider-authentication';
import PaymentProviderAuthenticationState, {
    DEFAULT_STATE,
} from './payment-provider-authentication-state';

export default interface PaymentProviderAuthenticationSelector {
    getPaymentProviderAuthentication(): PaymentProviderAuthentication | undefined;
    getPaymentProviderAuthenticationOrThrow(): PaymentProviderAuthentication;
}

export type PaymentProviderAuthenticationSelectorFactory = (
    state: PaymentProviderAuthenticationState,
) => PaymentProviderAuthenticationSelector;

export function createPaymentProviderAuthenticationSelectorFactory(): PaymentProviderAuthenticationSelectorFactory {
    const getPaymentProviderAuthentication = createSelector(
        (state: PaymentProviderAuthenticationState) => state.data,
        (data) => () => data,
    );

    const getPaymentProviderAuthenticationOrThrow = createSelector(
        getPaymentProviderAuthentication,
        (getPaymentProviderAuthentication) => () => {
            return guard(
                getPaymentProviderAuthentication(),
                () =>
                    new MissingDataError(MissingDataErrorType.MissingPaymentProviderAuthentication),
            );
        },
    );

    return memoizeOne(
        (
            state: PaymentProviderAuthenticationState = DEFAULT_STATE,
        ): PaymentProviderAuthenticationSelector => {
            return {
                getPaymentProviderAuthentication: getPaymentProviderAuthentication(state),
                getPaymentProviderAuthenticationOrThrow:
                    getPaymentProviderAuthenticationOrThrow(state),
            };
        },
    );
}
