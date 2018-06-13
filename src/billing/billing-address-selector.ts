import { mapToInternalAddress, InternalAddress } from '../address';
import { selector } from '../common/selector';

import BillingAddressState from './billing-address-state';

@selector
export default class BillingAddressSelector {
    constructor(
        private _billingAddress: BillingAddressState
    ) {}

    getBillingAddress(): InternalAddress | undefined {
        return this._billingAddress.data && mapToInternalAddress(this._billingAddress.data);
    }

    getUpdateError(): Error | undefined {
        return this._billingAddress.errors.updateError;
    }

    getLoadError(): Error | undefined {
        return this._billingAddress.errors.loadError;
    }

    isUpdating(): boolean {
        return !!this._billingAddress.statuses.isUpdating;
    }

    isLoading(): boolean {
        return !!this._billingAddress.statuses.isLoading;
    }
}
