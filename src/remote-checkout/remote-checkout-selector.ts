import RemoteCheckoutState from './remote-checkout-state';
import RemoteCheckout from './remote-checkout';
import RemoteCheckoutMeta from './remote-checkout-meta';

export default class RemoteCheckoutSelector {
    constructor(
        private _remoteCheckout: RemoteCheckoutState
    ) {}

    getCheckout(): RemoteCheckout | undefined {
        return this._remoteCheckout.data;
    }

    getCheckoutMeta(): RemoteCheckoutMeta | undefined {
        return this._remoteCheckout.meta;
    }
}
