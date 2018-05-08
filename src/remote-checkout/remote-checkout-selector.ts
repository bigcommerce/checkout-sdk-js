import { selector } from '../common/selector';
import { CustomerState } from '../customer';

import RemoteCheckout from './remote-checkout';
import RemoteCheckoutMeta from './remote-checkout-meta';
import RemoteCheckoutState from './remote-checkout-state';

@selector
export default class RemoteCheckoutSelector {
    constructor(
        private _remoteCheckout: RemoteCheckoutState,
        private _customer: CustomerState
    ) {}

    getCheckout(): RemoteCheckout | undefined {
        return this._remoteCheckout.data;
    }

    getCheckoutMeta(): RemoteCheckoutMeta | undefined {
        return this._remoteCheckout.meta;
    }

    getProviderId(): string | undefined {
        const customer = this._customer.data;

        return customer && customer.remote && customer.remote.provider;
    }
}
