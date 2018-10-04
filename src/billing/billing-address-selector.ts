import localeAddress from '../address/locale-address';
import { selector } from '../common/selector';
import { CountrySelector } from '../geography';

import BillingAddress from './billing-address';
import BillingAddressState from './billing-address-state';

@selector
export default class BillingAddressSelector {
    constructor(
        private _billingAddress: BillingAddressState,
        private _countries: CountrySelector
    ) {}

    getBillingAddress(): BillingAddress | undefined {
        if (!this._billingAddress.data) {
            return;
        }

        return localeAddress(this._billingAddress.data, this._countries.getCountries());
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
