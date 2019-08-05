import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import RemoteCheckoutState, { DEFAULT_STATE, RemoteCheckoutStateData } from './remote-checkout-state';

export default interface RemoteCheckoutSelector {
    getCheckout<TMethodId extends keyof RemoteCheckoutStateData>(
        methodId: TMethodId
    ): RemoteCheckoutStateData[TMethodId] | undefined;
}

export type RemoteCheckoutSelectorFactory = (state: RemoteCheckoutState) => RemoteCheckoutSelector;

export function createRemoteCheckoutSelectorFactory(): RemoteCheckoutSelectorFactory {
    const getCheckout = createSelector(
        (state: RemoteCheckoutState) => state.data,
        data => <TMethodId extends keyof RemoteCheckoutStateData>(methodId: TMethodId) => {
            return data[methodId];
        }
    );

    return memoizeOne((
        state: RemoteCheckoutState = DEFAULT_STATE
    ): RemoteCheckoutSelector => {
        return {
            getCheckout: getCheckout(state),
        };
    });
}
