import { selector } from '../common/selector';

import Customer from './customer';
import CustomerState from './customer-state';

@selector
export default class CustomerSelector {
    constructor(
        private _customer: CustomerState
    ) {}

    getCustomer(): Customer | undefined {
        return this._customer.data;
    }
}
