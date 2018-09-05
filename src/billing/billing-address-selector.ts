import { selector } from '../common/selector';

import BillingAddress from './billing-address';
import BillingAddressState from './billing-address-state';

@selector
export default class BillingAddressSelector {
    constructor(
        private _billingAddress: BillingAddressState
    ) {}

    getBillingAddress(): BillingAddress | undefined {
        return this._billingAddress.data;
    }

    getUpdateError(): Error | undefined {
        return this._billingAddress.errors.updateError;
    }

    getContinueAsGuestError(): Error | undefined {
        return this._billingAddress.errors.continueAsGuestError;
    }

    getLoadError(): Error | undefined {
        return this._billingAddress.errors.loadError;
    }

    isUpdating(): boolean {
        return !!this._billingAddress.statuses.isUpdating;
    }

    isContinuingAsGuest(): boolean {
        return !!this._billingAddress.statuses.isContinuingAsGuest;
    }

    isLoading(): boolean {
        return !!this._billingAddress.statuses.isLoading;
    }
}
