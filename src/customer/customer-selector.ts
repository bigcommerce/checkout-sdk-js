import { selector } from '../common/selector';

import CustomerState from './customer-state';
import InternalCustomer from './internal-customer';

@selector
export default class CustomerSelector {
    constructor(
        private _customer: CustomerState
    ) {}

    getCustomer(): InternalCustomer | undefined {
        return this._customer.data;
    }
}
