import { selector } from '../common/selector';

import RemoteCheckoutState, { RemoteCheckoutStateData } from './remote-checkout-state';

@selector
export default class RemoteCheckoutSelector {
    constructor(
        private _remoteCheckout: RemoteCheckoutState
    ) {}

    getCheckout<TMethodId extends keyof RemoteCheckoutStateData>(
        methodId: TMethodId
    ): RemoteCheckoutStateData[TMethodId] | undefined {
        return this._remoteCheckout.data[methodId];
    }
}
