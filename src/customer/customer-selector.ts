import localeAddress from '../address/locale-address';
import { selector } from '../common/selector';
import { CountrySelector } from '../geography';

import Customer from './customer';
import CustomerState from './customer-state';

@selector
export default class CustomerSelector {
    constructor(
        private _customer: CustomerState,
        private _countries: CountrySelector
    ) {}

    getCustomer(): Customer | undefined {
        if (!this._customer.data) {
            return;
        }

        return {
            ...this._customer.data,
            addresses: this._customer.data.addresses.map(
                address => localeAddress(address, this._countries.getCountries())
            ),
        };
    }
}
